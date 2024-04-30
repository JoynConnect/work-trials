import logging
import os
import sqlite3

from utils import setup_logger


logger = setup_logger(logging.getLogger(__name__))

STORAGE_PATH = 'api/storage.db'

def get_cursor():
    con = sqlite3.connect(STORAGE_PATH)
    cur = con.cursor()
    return con, cur


def load_status_distribution(status_distribution, high_priority_status_distribution):
    con, cur = get_cursor()

    data = [
        ['all'] + status_distribution,
        ['high_priority'] +  high_priority_status_distribution,
    ]
    cur.execute('CREATE TABLE status_distribution(scope, unresolved, resolved)')
    cur.executemany('INSERT INTO status_distribution VALUES (?, ?, ?)', data)
    con.commit()


def load_completed_by_user_by_date(completed_by_user_by_date):
    con, cur = get_cursor()
    data = []
    for day, by_user in completed_by_user_by_date.items():
        for assignee, count in by_user.items():
            data.append([day, assignee, count])

    cur.execute('CREATE TABLE completed_by_date(date, assignee, count)')
    cur.executemany('INSERT INTO completed_by_date VALUES (?, ?, ?)', data)
    con.commit()


def load_data_to_storage(status_distribution, high_priority_status_distribution, completed_by_user_by_date):
    if os.path.exists(STORAGE_PATH):
        logger.debug(f'Replacing {STORAGE_PATH}')
        os.remove(STORAGE_PATH)

    load_status_distribution(status_distribution, high_priority_status_distribution)
    load_completed_by_user_by_date(completed_by_user_by_date)
