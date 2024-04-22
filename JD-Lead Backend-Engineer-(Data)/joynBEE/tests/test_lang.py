import pytest
import joynBEE.langtools as lt
from joynBEE.textanalysis import Authorship

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


@pytest.fixture
def authorboat():

    return Authorship()


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


# def test_authorcorpgen(authorboat):


def test_user_docs(authorboat):
    source_platform = "jira"
    user = "Daisy_Langworth@yahoo.com"

    result = authorboat.get_user_embeds(
        corpus=CORPUS, source_platform=source_platform, user=user
    )

    assert result
    assert isinstance(result, list)


def test_resolve_user(authorboat):
    source_platform = "jira"
    user = "Daisy_Langworth@yahoo.com"

    authorboat.resolve_user_on_platform(
        corpus=CORPUS, source_platform=source_platform, user=user
    )
    assert authorboat.platform_embeddings
