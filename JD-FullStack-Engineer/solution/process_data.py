import argparse
import logging
import os
import typing as t
import data_typing as tp
from collections import defaultdict
from integrations import Integration, jira, notion, slack
from output_data import load_data_to_storage
from utils import setup_logger

logger = setup_logger(logging.getLogger(__name__))

# Enabled integrations
INTEGRATIONS = [
    jira,
    notion,
    slack,
]

RESOLVED_STATUSES = ['Closed', 'Completed']
UNRESOLVED = 0
RESOLVED = 1
HIGH_PRIORITY_STATUSES = ['High', 'Highest']


def update_status_distribution(integration: Integration,
                               data: t.Union[tp.ParsedJiraData, tp.ParsedNotionData],
                               frequency: t.List[int]) -> t.List[int]:
    if integration.key not in [jira.key, notion.key]:
        return frequency
    index = RESOLVED if data['status'] in RESOLVED_STATUSES else UNRESOLVED
    frequency[index] += 1
    return frequency


def update_high_priority_status_distribution(integration: Integration,
                                             data: t.Union[tp.ParsedJiraData, tp.ParsedNotionData],
                                             frequency: t.List[int]):
    if integration.key not in [jira.key, notion.key] or data['priority'] not in HIGH_PRIORITY_STATUSES:
        return frequency
    index = RESOLVED if data['status'] in RESOLVED_STATUSES else UNRESOLVED
    frequency[index] += 1
    return frequency


def update_completed_by_user_by_date(integration: Integration,
                                     data: t.Union[tp.ParsedJiraData, tp.ParsedNotionData],
                                     by_date_data) -> defaultdict:
    if integration.key not in [jira.key, notion.key] or data['status'] not in RESOLVED_STATUSES:
        return by_date_data

    by_date_data[data['updated']][data['assignee']] += 1
    return by_date_data


def log_stats(status_distribution, high_priority_status_distribution, completed_by_user_by_date):
    logger.info(f'Tasks Status distribution resolved={status_distribution[RESOLVED]} '
                f'unresolved={status_distribution[UNRESOLVED]}')
    logger.info(f'High Priority Task Status distribution resolved={status_distribution[RESOLVED]} '
                f'unresolved={status_distribution[UNRESOLVED]}')


def main(path: str) -> None:
    status_distribution = [0, 0]
    high_priority_status_distribution = [0, 0]
    completed_by_user_by_date: defaultdict = defaultdict(lambda: defaultdict(lambda: 0))

    for integration in INTEGRATIONS:
        for parsed_data in integration.parser(os.path.join(path, integration.raw_data)):
            status_distribution = update_status_distribution(integration, parsed_data, status_distribution)
            high_priority_status_distribution = update_high_priority_status_distribution(
                    integration, parsed_data, high_priority_status_distribution)
            completed_by_user_by_date = update_completed_by_user_by_date(integration,
                                                                         parsed_data,
                                                                         completed_by_user_by_date)

    load_data_to_storage(status_distribution, high_priority_status_distribution, completed_by_user_by_date)
    log_stats(status_distribution, high_priority_status_distribution, completed_by_user_by_date)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--path', help='Input data directory', default='raw_data')
    args = parser.parse_args()

    if not os.path.exists(args.path):
        logger.error(f'Input data directory "{args.path}" does not exists, please create it')
    else:
        main(args.path)
