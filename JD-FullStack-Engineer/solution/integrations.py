import json
import logging
import data_typing as tp
import typing as t

from collections import namedtuple
from utils import setup_logger


logger = setup_logger(logging.getLogger(__name__))

DATE_FORMAT = '%Y-%m-%d'


def jira_parser(input_file: str) -> t.Generator[tp.ParsedJiraData, None, None]:
    logger.info(f'Processing input file "{input_file}"')
    with open(input_file) as f:
        raw_data = json.load(f)

    try:
        for data in raw_data:
            yield {
                'assignee': data['assignee']['emailAddress'].lower(),
                'created': data['created'],
                'id': data['id'],
                'priority': data['priority']['name'],
                'status': data['status']['name'],
                'text': data['summary'],
                'updated': data['updated'],
            }
    except KeyError as e:
        logger.error(f'Missing expected field in Jira input data {e}')
        raise


def notion_parser(input_file: str) -> t.Generator[tp.ParsedNotionData, None, None]:
    logger.info(f'Processing input file "{input_file}"')
    with open(input_file) as f:
        raw_data = json.load(f)

    try:
        for data in raw_data:
            assignees = map(lambda p: p['email'].lower(),
                            data['properties']['Assignee']['people'])
            assignees_str = ','.join(assignees)
            yield {
                'assignee': assignees_str,
                'created': data['created_time'],
                'id': data['id'],
                'priority': data['properties']['Priority']['select']['name'],
                'status': data['properties']['Status']['select']['name'],
                'updated': data['last_edited_time'],
            }
    except KeyError as e:
        logger.error(f'Missing expected field in Notion input data {e}')
        raise


def slack_parser(input_file: str):
    #-> t.Generator[tp.ParsedSlackData, None, None]:
    logger.info(f'Processing input file "{input_file}"')
    with open(input_file) as f:
        raw_data = json.load(f)

    try:
        for data in raw_data:
            yield {
                'created': data['ts'],
                'text': data['text'],
                'channel': data['channel']
            }
    except KeyError as e:
        logger.error(f'Missing expected field in Slack input data {e}')


Integration = namedtuple('Integration', ['key', 'label', 'raw_data', 'parser'])
jira = Integration('jira', 'Jira', 'jiraData.json', jira_parser)
notion = Integration('notion', 'Notion', 'notionData.json', notion_parser)
slack = Integration('slack', 'Slack', 'slackData.json', slack_parser)
