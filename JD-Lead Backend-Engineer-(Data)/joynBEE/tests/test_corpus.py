import pytest
from joynBEE.analysis_primitives import Corpus, Temporal
import joynBEE.platforms as pl


@pytest.fixture
def platform_data_list():
    jira_data = pl.Jira()
    jira_data.parse_data()
    notion_data = pl.Notion()
    notion_data.parse_data()
    slack_data = pl.Slack()
    slack_data.parse_data()

    data_list = [jira_data, notion_data, slack_data]
    return data_list


def test_align(platform_data_list):
    # check initialization
    cor = Corpus()
    assert cor.aligned == []

    # check to be sure we have all the data we expect
    cor.align_data(data_list=platform_data_list)
    assert len(cor.aligned) == 450

    # check to be sure IDs are unique across corpus
    unique_ids = set([x.corpus_id for x in cor.aligned])
    assert len(cor.aligned) == len(unique_ids)


def test_temporal(platform_data_list):

    cor = Corpus()
    cor.align_data(data_list=platform_data_list)

    temp = Temporal()
    temp.analyze(cor.aligned)
    assert temp.results
