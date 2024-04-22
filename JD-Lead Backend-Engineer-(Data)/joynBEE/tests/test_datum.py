import joynBEE.analysis_primitives as ap
from dataclasses import asdict
from datetime import datetime
from langchain.docstore.document import Document
import pytest


@pytest.fixture
def core_datum():
    return ap.CoreDatum(
        "testing_platform",
        "fake_id",
        datetime(1983, 3, 31, 5, 4),
        "low",
        "open",
        ["fakey McFakerson", "Bob"],
        "Lorem ipsum doesn't even start with a whole word!",
    )


def test_coreDatum(core_datum):
    docform = core_datum.to_lcdoc()
    assert isinstance(docform, Document)
    shouldbe = {
        "platform": "testing_platform",
        "platform_id": "fake_id",
        "update_time": datetime(1983, 3, 31, 5, 4),
        "priority": "low",
        "status": "open",
        "owners": ["fakey McFakerson", "Bob"],
        "content": "Lorem ipsum doesn't even start with a whole word!",
    }
    assert asdict(core_datum) == shouldbe

    with pytest.raises(TypeError):
        _ = ap.CoreDatum("not", "enough", "fields")
