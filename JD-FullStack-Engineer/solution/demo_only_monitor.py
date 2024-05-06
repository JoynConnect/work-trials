'''
DEMO only script, not applicable to a realistic AWS environment.
'''
import argparse
import logging
import time
from datetime import datetime, timedelta
from watchdog.observers import Observer
from watchdog.events import LoggingEventHandler, FileSystemEventHandler
from process_data import main
from utils import setup_logger

logger = setup_logger(logging.getLogger(__name__))


class IntegrationInputMonitor(FileSystemEventHandler):
    def __init__(self, path):
        super().__init__()
        self.monitored_path = path
        self.should_run = False

    def delayed_run(self):
        time.sleep(1)
        main(self.monitored_path)

    def on_modified(self, event):
        if not event.is_directory:
            self.delayed_run()

    def on_created(self, event):
        if not event.is_directory:
            self.delayed_run()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--path', help='Input data directory', default='raw_data')
    args = parser.parse_args()
    path = args.path

    event_handler = IntegrationInputMonitor(path)
    observer = Observer()
    observer.schedule(event_handler, path, recursive=True)
    observer.start()
    try:
        while observer.is_alive():
            observer.join(1)
    finally:
        observer.stop()
        observer.join()
