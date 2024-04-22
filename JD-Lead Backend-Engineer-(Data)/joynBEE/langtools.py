from langchain import hub
from langchain.cache import InMemoryCache
from langchain.chains import create_retrieval_chain
from langchain.globals import set_llm_cache
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_cohere import ChatCohere
from langchain_cohere.embeddings import CohereEmbeddings
from langchain.chains.combine_documents import create_stuff_documents_chain
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
        self.retrievador = None
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

    @staticmethod
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    def assign_prompt(self, keyword: str = "generic_expert"):

        prompt = ChatPromptTemplate.from_template(
            """
            Answer the following question based only on the provided context:

            <context>
            {context}
            </context>

            Question: {input}
            """
        )
        return prompt

    def setup_vectorstore(self, corpus: Corpus):
        # assemble text
        docs = [x.to_lcdoc() for x in corpus.aligned]

        prompt = self.assign_prompt()
        document_chain = create_stuff_documents_chain(self.llm, prompt)

        # create vectorstore
        vectorstore = Chroma.from_documents(documents=docs, embedding=self.embeddings)
        retrievador = vectorstore.as_retriever()
        self.retrievador = create_retrieval_chain(retrievador, document_chain)

    def setup(self, corpus: Corpus):
        self.setup_vectorstore(corpus=corpus)

        # Retrieve and generate using the relevant snippets
        retriever = self.vectorstore.as_retriever()
        prompt = hub.pull("rlm/rag-prompt")

        # chain
        rag_chain = (
            {"context": retriever | self.format_docs, "question": RunnablePassthrough()}
            | prompt
            | self.llm
            | StrOutputParser()
        )

        self.rag_chain = rag_chain

    def query(self, query_text: str):
        results = self.retrievador.invoke({"input": query_text})
        self.logger.info(results)
        return results
