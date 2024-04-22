import logging
from collections import defaultdict, Counter
from langchain_cohere import CohereEmbeddings
from langchain_chroma import Chroma
from uuid import uuid4

from .analysis_primitives import CorpusAnalyst, Corpus, CoreDatum
from .utilities import get_secret


class Authorship(CorpusAnalyst):
    """
    Proposed class for determining cross-platform authorship attribution
    (aligning real humans with their digital representations). This
    would ideally be performed on initial creation of a company
    knowledge base, and then incrementally thereafter, to make
    permissions management and activity summarization easier.
    """

    def __init__(self) -> None:
        super().__init__()
        self.setup()
        self.logger = logging.getLogger(__class__.__name__)
        self.platform_embeddings = {}
        self.user_directory = {}

    def setup(self):
        # TODO: enable more flexibility in embeddings, as in other langchain tools
        self.embeddings_model = CohereEmbeddings(
            cohere_api_key=get_secret("COHERE_API_KEY")
        )

    def get_target_plat_docs(self, corpus, target_platform):

        return [
            entry.to_lcdoc()
            for entry in corpus.aligned
            if entry.platform == target_platform
        ]

    def get_user_embeds(self, corpus, source_platform, user):
        # get a user's corpus on one platform
        # embed the user's corpus content (vectorize)
        user_docs = [
            entry.content
            for entry in corpus.aligned
            if entry.platform == source_platform and user in entry.owners
        ]

        return self.embeddings_model.embed_documents(user_docs)

    def resolve_user_on_platform(self, corpus, source_platform, user):
        user_id = uuid4()
        user_dict = {source_platform: user}
        user_corp = self.get_user_embeds(
            corpus=corpus, source_platform=source_platform, user=user
        )
        other_plats = list(
            set(
                [
                    item.platform
                    for item in corpus.aligned
                    if item.platform != source_platform
                ]
            )
        )

        for plat in other_plats:
            # embed/vectorize the rest of the platform corpus and SAVE IT
            # not most efficient for shrinking search space, but can be
            # economical in terms of API calls, depending on embedding.
            self.logger.info(f"########## Processing {plat.upper()}")
            if plat in self.platform_embeddings.keys():
                db = self.platform_embeddings[plat]
            else:
                other_docs = self.get_target_plat_docs(
                    corpus=corpus, target_platform=plat
                )
                db = Chroma.from_documents(other_docs, self.embeddings_model)
                self.platform_embeddings[plat] = db
            # use similarity_search_by_vector on other platforms' docs
            docs = db.similarity_search_by_vector(user_corp)
            self.logger.info(f"Top five returned docs: {docs[:5]}")
            # use majority of returned items' owners to determine
            # original user's ID on other platform.

            # unpack owners from results
            top_alt = Counter([doc.metadata["owners"] for doc in docs]).most_common()[0]
            self.logger.info(f"Top match in {plat} for this user: {top_alt}")
            user_dict[plat] = top_alt

        self.logger.info(f"Processed user {user}, derived matches: {user_dict}")
        # TODO: use this to prevent re-work/coverage of already-processed users
        self.user_directory[user_id] = user_dict

    def get_user_embeddings(self, corpus: Corpus, source_platform: str, user: str):

        user_corpora = defaultdict(CoreDatum)

        for platform, users in [(x.platform, x.owners) for x in corpus.aligned]:
            ownerstring = "_".join(users)
            idstring = f"{platform}_{ownerstring}"
            itertrue = filter(
                lambda x: (x.platform, x.owners) == (platform, users), corpus.aligned
            )
            user_corpora[idstring] = [x for x in itertrue]

        self.logger.info(
            f"After splitting corpus by user, there are {len(user_corpora)} entries."
        )
        return user_corpora
