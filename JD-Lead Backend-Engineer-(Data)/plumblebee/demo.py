from plumblebee.analysis_primitives import (
    CoreDatum, Data, ParseAttributeError
    )

from pathlib import Path
from datetime import datetime


# ingest data
DATA_DIR = Path(__file__).parents[1] / "dataGen"
assert DATA_DIR


class ParseError(Exception):
    def __init__(self, platform: str):
        message = f"""Could not parse {platform} datum with current
        definition."""
        super().__init__(message)


class Jira(Data):

    def __init__(self) -> None:
        super().__init__(platform="jira")
        self.time_pattern = "%Y-%m-%dT%H:%M:%S:%fZ"
        # "2024-04-04T11:37:47.585Z"

    def parse_datum(self, raw_datum: dict) -> CoreDatum:

        datum_dict = {
            "platform": self.platform,
            "platform_id": raw_datum.get("id"),
            "update_time": datetime.strptime(
                raw_datum.get("updated"), self.time_pattern),
            "priority": raw_datum.get("priority").get("name"),
            "status": raw_datum.get("status").get("name"),
            "owners": raw_datum.get("assignee").get("emailAddress"),
            "content": raw_datum.get("summary")}

        return CoreDatum(**datum_dict)


class Notion(Data):

    def __init__(self) -> None:
        super().__init__(platform="notion")
        self.time_pattern = "%Y-%m-%dT%H:%M:%S:%fZ"

    def collect_text(self, texty_dict: dict) -> str:
        if not texty_dict:
            return None
        titles = [x["text"]["content"] for x in texty_dict["title"]]
        title = "\n".join(titles)
        # TODO: figure out how Notion represents other, non-titular text
        # blocks, put them here
        # NOTE: this will depend on our textual limits. We may want to inject
        # a small-scale summary process here to ensure we are not overloading
        # the CoreDatum content field.
        return f"{title}\nOTHER_STUFF_GOES_HERE"

    def _parse_datum(self, raw_datum: dict) -> CoreDatum:
        datum_properties = raw_datum.get("properties")
        if not datum_properties:
            raise ParseAttributeError(["properties"])

        datum_dict = {
            "platform": self.platform,
            "platform_id": raw_datum.get("id"),
            "update_time": datetime.strptime(
                raw_datum["last_edited_time"], self.time_pattern),
            "priority": datum_properties.get(
                "Priority").get("select").get("name"),
            "status": datum_properties.get("Status").get("select").get("name"),
            "owners": [x.get("name") for x in datum_properties.get(
                "Assignee").get("people")],
            "content": self.collect_text(datum_properties.get("Name"))
            }

        return CoreDatum(**datum_dict)
