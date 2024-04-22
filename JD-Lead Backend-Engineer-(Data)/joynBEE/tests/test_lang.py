import pytest
import joynBEE.langtools as lt

from joynBEE.basic import assemble_corpus

all_platforms = ["jira", "notion", "slack"]

CORPUS = assemble_corpus(all_platforms)


@pytest.fixture
def nlp():
    # Chose Cohere as the API that supported RAG and
    # didn't give me rate-limit issues.
    return lt.EmbeddedCorpus(corpus=CORPUS, tool="cohere")


@pytest.fixture
def ragdoll():

    return lt.RAGDoll(corpus=CORPUS, tool="cohere")


def test_init(nlp):

    assert nlp
    assert nlp.llm
    assert nlp.embeddings
    assert nlp.logger

    with pytest.raises(NotImplementedError):
        _ = lt.EmbeddedCorpus(corpus=["x", "y", "z"], tool="fake")


def test_query(ragdoll):

    res = ragdoll.query("Quis custodiet ipsos custodies?")
    assert isinstance(res, str)


# def test_authorship(ragdoll):

#     res = nlp.query(
#         "Which slack user writes most like jira user 'Jimmie82@hotmail.com'?"
#     )
#     assert isinstance(res, dict)
#     assert len(res["context"]) == 4
