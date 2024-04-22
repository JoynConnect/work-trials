from joynBEE.analysis_primitives import (
    CoreDatum, Data, ParseAttributeError
    )
import hashlib
from datetime import datetime


class Jira(Data):

    def __init__(self) -> None:
        super().__init__(platform="jira")
        self.time_pattern = "%Y-%m-%dT%H:%M:%S"

    def consolidatum(self, raw_datum: dict):

        datum_dict = {
            "platform": self.platform,
            "platform_id": raw_datum.get("id"),
            "update_time": self.parse_time(raw_datum.get("updated")),
            "priority": raw_datum.get("priority").get("name"),
            "status": raw_datum.get("status").get("name"),
            "owners": [(raw_datum.get("assignee").get("emailAddress"))],
            "content": raw_datum.get("summary")}

        return datum_dict

    def parse_time(self, timestring: str):
        timestring = timestring[:-5]
        return datetime.strptime(timestring, self.time_pattern)

    def parse_datum(self, raw_datum: dict) -> CoreDatum:

        datum_dict = self.consolidatum(raw_datum)

        return CoreDatum(**datum_dict)


class Notion(Data):

    def __init__(self) -> None:
        super().__init__(platform="notion")
        self.time_pattern = "%Y-%m-%dT%H:%M:%S"

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

    def parse_time(self, timestring: str):
        timestring = timestring[:-5]
        return datetime.strptime(timestring, self.time_pattern)

    def _parse_datum(self, raw_datum: dict) -> CoreDatum:
        datum_properties = raw_datum.get("properties")
        if not datum_properties:
            raise ParseAttributeError(["properties"])

        datum_dict = {
            "platform": self.platform,
            "platform_id": raw_datum.get("id"),
            "update_time": self.parse_time(raw_datum.get("last_edited_time")),
            "priority": datum_properties.get(
                "Priority").get("select").get("name"),
            "status": datum_properties.get("Status").get("select").get("name"),
            "owners": [x.get("email") for x in datum_properties.get(
                "Assignee").get("people")],
            "content": self.collect_text(datum_properties.get("Name"))
            }

        return CoreDatum(**datum_dict)


class Slack(Data):

    def __init__(self) -> None:
        super().__init__(platform="slack")

    def assign_importance(self, raw_datum: dict) -> tuple[str, str]:

        return ()

    def parse_time(self, timestring):
        """
        ts in Slack is an aggregate field, latently encoding epoch time
        as well as platform-specific sequencing info. This method extracts
        the epoch time (as determined by some seat-of-pants experimentation)
        and makes it into a datetime object.

        :param timestring: string value found in "ts" field
        """
        time_int = int(timestring[:10])
        return datetime.fromtimestamp(time_int)

    def _parse_datum(self, raw_datum: dict) -> CoreDatum:

        # a Slack ts is unique within a channel, so channel+ts is completely
        # unique in a given Slack organization
        unique_id = "".join([raw_datum.get("ts"), raw_datum.get("channel")])

        datum_dict = {
            "platform": self.platform,
            "platform_id": hashlib.md5(unique_id.encode()).hexdigest(),
            "update_time": self.parse_time(raw_datum.get("ts")),
            "priority": "comment",
            "status": "comment",
            "owners": [raw_datum.get("user")],
            "content": raw_datum.get("text")
            }

        return CoreDatum(**datum_dict)
