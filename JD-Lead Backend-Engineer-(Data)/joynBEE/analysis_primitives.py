from collections import defaultdict
from dataclasses import dataclass, asdict
import json
import logging
import hashlib
from itertools import pairwise, groupby
from datetime import datetime
from dateutil.rrule import rrule, DAILY
from pathlib import Path
from langchain.docstore.document import Document

DATA_DIR = Path(__file__).parents[1] / "dataGen"
assert DATA_DIR, f"Data directory not found at {DATA_DIR}"


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

    def to_lcdoc(self):
        metadata = {}
        for key, value in asdict(self).items():
            match key:
                case "content":
                    continue
                case "owners":
                    # NOTE: this is a janky HACK that should be fixed
                    # at the Corpus level
                    metadata[key] = value[0]
                case _:
                    metadata[key] = str(value)
        page_content = self.content

        return Document(page_content=page_content, metadata=metadata)


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
    """
    Per-platform data acquisition tooling: loads
    and shapes platform data into an array of CoreDatum instances.
    """

    def __init__(self, platform: str) -> None:
        self.platform = platform
        self.cache = []
        self.logger = logging.getLogger(__class__.__name__)
        self.errors = 0

    def get_platform_data(self):
        """
        Load platform data from file - NOTE: this is appropriate for this
        minimal implementation, but from-file is an unlikely paradigm
        for receiving API data. In a mature version, this would likely
        be replaced by an API call with appropriate pagination (see
        plumbingbird library).
        """
        filename = DATA_DIR / f"{self.platform}Data.json"
        assert filename, f"""No data found in {DATA_DIR}
        for platform {self.platform}"""
        with open(filename, "r+") as fyle:
            filedata = json.load(fyle)
        return filedata

    def is_complete(self, parsed_datum: CoreDatum) -> bool:
        """
        Checks for minimal representation of required fields for
        this source's objects.
        """
        result = False
        missing_attrs = [
            key for key in asdict(parsed_datum).keys() if not asdict(parsed_datum)[key]
        ]
        if len(missing_attrs) == 0:
            result = True
        return result

    def conforms(self, parsed_datum: CoreDatum) -> bool:
        """
        Intended for additional checks on per-platform data integrity,
        a deeper calculation than just looking for empty fields. Given
        limited generated data, not currently implemented for any
        platform.
        """
        raise NotImplementedError("This must be defined in a child class.")

    def validatum(self, parsed_datum: CoreDatum) -> bool:
        """
        Check the parsed datum for completeness
        (and in future, expected values in fields).
        """
        return self.is_complete(parsed_datum=parsed_datum)
        # TODO: define platform-specific qualia in self.conforms()
        # wellformed = self.conforms(parsed_datum=parsed_datum)
        # return all([populated, wellformed])

    def parse_datum(self, raw_datum: dict, failure_limit: int = 100) -> CoreDatum:
        """
        Using platform-specific logic to parse content for a CoreDatum
        representation of the incoming JSON. If parsing fails, logs
        the error up until the failure limit is reached.

        :param raw_datum dict: dictionary representation of entry from JSON
        :param failure_limit int: number of acceptable failures for class
            (default 100)
        :raises IndexError: if the number of failures exceeds the limit
        """
        if self.errors >= failure_limit:
            raise IndexError(f"Too many failures ({self.errors})")
        try:
            return self._parse_datum(raw_datum)
        except Exception as e:
            self.errors += 1
            self.logger.warning(ParseError(e))

    def parse_data(self, data: list[dict] = None) -> None:
        if not data:
            data = self.get_platform_data()
        self.cache = [x for x in map(self.parse_datum, data) if self.validatum(x)]

        self.logger.info(
            f"""Finished processing {len(data)} items with
            {self.errors} errors."""
        )


class Corpus:
    """
    Class for aggregating platform-specific Data objects into a
    unified body of data for analytical purposes.
    """

    def __init__(self) -> None:
        self.aligned = []

    def id_item(self, datum: CoreDatum) -> CoreDatum:
        """
        Items within a Corpus are only guaranteed uniqueness by a combo
        of both platform and platform_id, so this method adds a consistently-shaped
        hash of those fields to each corpus item.
        """

        unique_id = "".join([datum.platform, datum.platform_id])
        datum.corpus_id = hashlib.md5(unique_id.encode()).hexdigest()
        return datum

    def align_data(self, data_list: list[Data]):
        """
        Unpacks the caches of the passed per-platform Data objects,
        flattening them into a single body of same-shaped CoreDatum objects
        for cross comparison.
        """
        total_corpus = [self.id_item(item) for x in data_list for item in x.cache]
        self.aligned = total_corpus


class CorpusAnalyst:
    """
    A base class for chainable analysis components, including basic
    corpus stats for any submitted corpus, though proper analysis
    is intended to be performed in child classes.
    """

    def __init__(self) -> None:
        self.results = None
        self.logger = logging.getLogger(__class__.__name__)
        self.start = None
        self.end = None
        self.span = None

    def get_basic_stats(self, corpus: list[CoreDatum]):
        """
        'Basic stats' refers to the temporal outline of the
        corpus: the span of time over which entries exist,
        its length and start/end.
        """

        self.start = min([x.update_time for x in corpus])
        self.logger.debug(f"Corpus starts at {self.start}")
        self.end = max([x.update_time for x in corpus])
        self.logger.debug(f"Corpus ends at {self.end}")

        corpus_lifespan = self.end - self.start
        self.span = corpus_lifespan

    def analyze(self, *args, **kwargs):
        raise NotImplementedError("This must be defined in a child class")


class Temporal(CorpusAnalyst):
    """
    Analyst for profiling activity in the corpus over time:
    splits by platform and user+platform.
    """

    def __init__(self) -> None:
        super().__init__()

    def analyze(self, corpus: list[CoreDatum]):
        self.get_basic_stats(corpus=corpus)

        report = {}
        corpus_population = groupby(
            set([(x.platform, u) for x in corpus for u in x.owners]), key=lambda x: x[0]
        )
        report["population"] = corpus_population

        # generate sequence of days over lifespan
        # NOTE: Because the total span of data as generated is only 50 days,
        # I chose daily quanta vs monthly (a more common business span)

        quanta = list(rrule(DAILY, dtstart=self.start, until=self.end))
        sequence = list(pairwise(quanta))
        daily_stats = {}
        platform_days = defaultdict(int)
        for span_start, span_end in sequence:
            relevant_corpus = [
                x
                for x in corpus
                if x.update_time >= span_start and x.update_time < span_end
            ]
            # platform-level analysis
            platform_activity = groupby(relevant_corpus, key=lambda x: x.platform)
            actividict = {}
            for key, results in platform_activity:
                actividict[key] = sum(1 for _ in results)
                platform_days[key] += 1

            # user analysis
            # unpack lists of users w platforms
            user_tups = [(x.platform, u, x.corpus_id) for x in corpus for u in x.owners]
            user_activity = groupby(user_tups, key=lambda x: (x[0], x[1]))
            user_dict = {}
            for key, results in user_activity:
                user_dict[key] = sum(1 for _ in results)

            daily_entry = {"platforms": actividict, "users": user_dict}
            daily_stats[span_start.strftime("%Y-%m-%d")] = daily_entry

        report["daily_stats"] = daily_stats
        self.results = report
