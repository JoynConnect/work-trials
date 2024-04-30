# Task 1: Prototype for Data Cleaning and Contextual Analysis

## Process overview
- Raw input data in JSON format is loaded and parsed by integration-specific parsers that output
  cleaned and standarized data structure.
- The standarized data structure work as input for the functions making the metrics/stats calculations.
- The final step loads the calculated data into a storage (sqlite db) where it can be accessed for future tasks.

## Code Structure

This task is comprised of 5 python modules, main code located in `process_data.py` module.

- `process_data.py`: It's the entry to point to the whole process. It holds the metrics/stats calculation.
- `integrations.py`: Contains the functions to parse each integration or data-source-specific data (Jira, Notion, Slack)
   which are called from `process_data.py`.
- `output_data.py`: Defines all the functions involved in writing the data to a Sqlite database that will be used downstream (Task 2).
- `data_typing.py`: Defines the types used in annotations.
- `utils.py`: Defines utility functions, for now it only has `setup_logger` to create the logger handler and formatter.

## Setup

- Create a directory that will hold the input data from all the integrations, the script uses `raw_data` as default value.

## To execute the process

`python process_data.py` or `python process_data.py --path 'the_raw_data_directory'
