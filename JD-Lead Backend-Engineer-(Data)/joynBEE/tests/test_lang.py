import pytest
import joynBEE.langtools as lt

from joynBEE.basic import assemble_corpus


@pytest.fixture
def nlp():
    all_platforms = ["jira", "notion", "slack"]

    corpus = assemble_corpus(all_platforms)
    # Chose Cohere as the API that supported RAG and
    # didn't give me rate-limit issues.
    return lt.EmbeddedCorpus(corpus=corpus, tool="cohere")


def test_init(nlp):

    assert nlp
    assert nlp.llm
    assert nlp.embeddings
    assert nlp.retrievador
    assert nlp.logger

    with pytest.raises(NotImplementedError):
        _ = lt.EmbeddedCorpus(corpus=["x", "y", "z"], tool="fake")


def test_query(nlp):

    res = nlp.query("Quis custodiet ipsos custodies?")
    assert isinstance(res, dict)
    assert len(res["context"]) == 4


def test_authorship(nlp):

    res = nlp.query(
        "Which slack user writes most like jira user 'Jimmie82@hotmail.com'?"
    )
    assert isinstance(res, dict)
    assert len(res["context"]) == 4
