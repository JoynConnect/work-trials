from langchain import hub
from langchain.cache import InMemoryCache
from langchain.globals import set_llm_cache
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_cohere import ChatCohere
from langchain_cohere.embeddings import CohereEmbeddings
from langchain_chroma import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from joynBEE.analysis_primitives import Corpus
from joynBEE.utilities import get_secret
import logging


class EmbeddedCorpus:

    def __init__(self, corpus: Corpus, tool: str) -> None:
        self.llm = None
        self.vectorstore = None
        self.assign_tooling(tool=tool)
        self.setup_vectorstore(corpus=corpus)
        self.logger = logging.getLogger(__class__.__name__)

    def assign_tooling(self, tool: str):
        embeddings = None
        match tool:
            case "openai":
                api_key = get_secret("OPENAI_API_KEY")
                llm = ChatOpenAI(api_key=api_key, model="gpt-3.5-turbo-0125")
                embeddings = OpenAIEmbeddings(api_key=api_key)
            case "cohere":
                api_key = get_secret("COHERE_API_KEY")
                llm = ChatCohere(cohere_api_key=api_key)
                embeddings = CohereEmbeddings(cohere_api_key=api_key)
            case _:
                raise NotImplementedError(f"Tool {tool} is not supported")
        set_llm_cache(InMemoryCache())
        self.embeddings = embeddings
        self.llm = llm
        return

    def setup_vectorstore(self, corpus: Corpus):
        # assemble text
        docs = [x.to_lcdoc() for x in corpus.aligned]

        # create vectorstore
        self.vectorstore = Chroma.from_documents(
            documents=docs, embedding=self.embeddings
        )


class RAGDoll(EmbeddedCorpus):

    def __init__(self, corpus: Corpus, tool: str, prompt_key: str = None) -> None:
        super().__init__(corpus, tool)
        self.retrievador = None
        self.setup(corpus=corpus, prompt_key=prompt_key)

    def assign_prompt(self, keyword: str = "generic_expert"):
        """
        Based on a keyword, assign a prompt template for answering
        queries with this model. Currently only two implemented:
        context-bounded (default) and the one pulled from the hub.
        """

        match keyword:

            case "context_bounded":
                template = """
            Answer the following question based only on the provided context:

            <context>
            {context}
            </context>

            Question: {input}
            """
            case _:
                None

        try:
            prompt = ChatPromptTemplate.from_template(template)
            varname = "input"
        except Exception as e:
            self.logger.warning(f"Prompt assignment encountered an error: {e}")
            prompt = hub.pull("rlm/rag-prompt")
            self.logger.debug(f"Prompt: {prompt}")
            varname = "question"

        return prompt, varname

    @staticmethod
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    def setup(self, corpus: Corpus, prompt_key: str = None):
        """
        Create a RAG chain retriever from the provided corpus.
        """
        if not self.vectorstore:
            self.setup_vectorstore(corpus=corpus)

        # Retrieve and generate using the relevant snippets
        retriever = self.vectorstore.as_retriever()
        prompt, varname = self.assign_prompt(prompt_key)

        # chain
        self.retrievador = (
            {"context": retriever | self.format_docs, varname: RunnablePassthrough()}
            | prompt
            | self.llm
            | StrOutputParser()
        )

    def query(self, query_text: str):
        """
        Query the RAG engine created by this object. Currently returns
        all metadata along with the natural language answer, against
        future refinement.
        """
        results = self.retrievador.invoke(query_text)
        self.logger.info(results)
        return results
