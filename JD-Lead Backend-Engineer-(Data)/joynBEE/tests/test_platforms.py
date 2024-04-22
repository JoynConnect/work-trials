import pytest
from datetime import datetime
from joynBEE.basic import assign_data_platform
from joynBEE.platforms import Jira, Notion, Slack
from joynBEE.analysis_primitives import CoreDatum


@pytest.fixture
def jira_data():
    return Jira()


@pytest.fixture
def notion_data():
    return Notion()


@pytest.fixture
def slack_data():
    return Slack()


@pytest.mark.parametrize("platform_name,platform", [
    ("jira", Jira),
    ("slack", Slack),
    ("notion", Notion)])
def test_get_data_good(platform_name, platform):
    assigned = assign_data_platform(platform_name)
    assert assigned.__class__ == platform


def test_get_data_bad():

    with pytest.raises(NotImplementedError):
        _ = assign_data_platform("fake")


@pytest.mark.parametrize("platform_name",
                         ["jira", "notion", "slack"])
def test_ingest(platform_name):
    platform = assign_data_platform(platform_name)
    data = platform.get_platform_data()
    assert data
    assert isinstance(data, list)
    assert isinstance(data[0], dict)


def test_jira_parse(jira_data):
    jira_data.parse_data()
    assert jira_data.cache

    first = jira_data.cache[0]
    assert isinstance(first, CoreDatum)
    assert first.platform == "jira"
    assert first.platform_id == "JIRA-0"
    assert isinstance(first.update_time, datetime)
    assert first.update_time == datetime(
        2024, 4, 4, hour=11, minute=37, second=47)
    assert first.status == "Open"
    assert first.priority == "Medium"
    assert first.content == "Amicitia conqueror tamisium."
    assert first.owners == ["Daisy_Langworth@yahoo.com"]


def test_notion_parse(notion_data):
    notion_data.parse_data()
    assert notion_data.cache

    first = notion_data.cache[0]
    assert first.platform_id == "02aedd03-1938-45f5-9283-b039909bbeaf"
    assert first.platform == "notion"
    assert first.update_time == datetime(
        2024, 4, 12, hour=10, minute=37, second=15)
    assert first.owners == ["Brendon.Simonis81@yahoo.com"]
    assert first.priority == "Medium"
    assert first.status == "In Progress"
    assert first.content == "deliver innovative ROI\nOTHER_STUFF_GOES_HERE"


def test_slack_parse(slack_data):

    slack_data.parse_data()
    assert slack_data.cache

    first = slack_data.cache[0]
    assert first.platform == "slack"
    assert first.platform_id == "76e6ef199f58b7c61a5e874ce3220b9e"
    assert first.update_time == datetime(2024, 4, 5, 13, 2, 39)
    assert first.priority == "comment"
    assert first.status == "comment"
    assert first.owners == ["U0DdeffBf"]
    assert first.content == "Talus confido defluo valeo voluptas suspendo bos."
