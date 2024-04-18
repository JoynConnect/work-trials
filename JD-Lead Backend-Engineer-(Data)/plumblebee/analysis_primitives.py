# import plumbingbird as pb
from dataclasses import dataclass
import logging
import uuid
from datetime import datetime


@dataclass
class CoreDatum:
    """
    Grossly simplified shared model for a consistent entry shape,
    for ease of alignment across a multi-platform corpus.
    """

    platform: str
    platform_id: str
    update_time: datetime
    priority: str
    status: str
    owners: list[str]
    content: str


class ParseError(Exception):
    def __init__(self, error_msg) -> None:
        message = f"""An unknown parsing error occurred: {error_msg}"""
        super().__init__(message)


class ParseAttributeError(Exception):
    def __init__(self, missing_attr: str):
        message = f"""Could not parse datum for {missing_attr} with current
        definition."""
        super().__init__(message)


class Data:

    def __init__(self, platform: str) -> None:
        self.platform = platform
        self.cache = []
        self.logger = logging.getLogger(__class__.__name__)
        self.errors = 0

    def parse_datum(self, raw_datum: dict) -> CoreDatum:
        try:
            parsed_datum = self._parse_datum(raw_datum)
            missing_attrs = [
                key for key in parsed_datum.dir().keys()
                if not parsed_datum[key]]
            if missing_attrs:
                raise ParseAttributeError(missing_attr=missing_attrs)

        except Exception as e:
            self.errors += 1
            self.logger.warning(ParseError(e))

    def parse_data(self, data: list[dict]) -> None:
        self.cache = data.map(self.parse_datum)
        self.logger.info(
            f"""Finished processing {len(data)} items with
            {self.errors} errors.""")


class Corpus:

    def __init__(self) -> None:
        self.aligned = []

    def id_item(self, datum: CoreDatum) -> CoreDatum:
        datum["corpus_id"] = uuid.uuid4()
        return datum

    def align_data(self, data_list: list[Data], sort: str = "update_time"):
        total_corpus = [item for x in data_list for item in x.cache]
        total_corpus.sort(key=sort)
        self.aligned = total_corpus


class CorpusAnalyst:

    def __init__(self) -> None:
        pass

    def analyze(self, corpus: list[Data]):
        raise NotImplementedError("This must be defined in a child class.")
