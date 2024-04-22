import logging
from collections import defaultdict
from joynBEE.analysis_primitives import CorpusAnalyst, Corpus, CoreDatum


class Authorship(CorpusAnalyst):

    def __init__(self) -> None:
        super().__init__()
        self.logger = logging.getLogger(__class__.__name__)

    # TODO: figure out how to do authorship attribution by user
    # metadata partitioning? separately embedded corpora?
    # Just use embeddings and compare them, don't ask the model.

    def get_user_embeddings(self, corpus: Corpus):

        user_corpora = defaultdict(CoreDatum)

        for platform, users in [(x.platform, x.owners) for x in corpus]:
            ownerstring = "_".join(users)
            idstring = f"{platform}_{ownerstring}"
            itertrue = filter(
                lambda x: (x.platform, x.owners) == (platform, users), corpus
            )
            user_corpora[idstring] = [x for x in itertrue]

        return user_corpora
