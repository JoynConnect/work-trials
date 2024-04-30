import typing as t


class ParsedJiraData(t.TypedDict):
    assignee: str
    created: str
    id: str
    priority: str
    status: str
    text: str
    updated: str


class ParsedNotionData(t.TypedDict):
    assignee: str
    created: str
    id: str
    priority: str
    status: str
    updated: str


class ParsedSlackData(t.TypedDict):
    channel: str
    created: str
    text: str
