import joynBEE.analysis_primitives as ap
from dataclasses import asdict
from datetime import datetime
from langchain.docstore.document import Document
import pytest


@pytest.fixture
def core_dict():
    return {
        "platform": "testing_platform",
        "platform_id": "fake_id",
        "update_time": datetime(1983, 3, 31, 5, 4),
        "priority": "low",
        "status": "open",
        "owners": ["fakey McFakerson", "Bob"],
        "content": "Lorem ipsum doesn't even start with a whole word!",
    }


@pytest.fixture
def core_datum(core_dict):
    return ap.CoreDatum(**core_dict)


@pytest.fixture
def platformdata():
    return ap.PlatformData(platform="testing")


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


def test_platformData(platformdata, core_datum, core_dict):

    with pytest.raises(AssertionError):
        platformdata.get_platform_data()

    with pytest.raises(NotImplementedError):
        platformdata.conforms(core_datum)

    assert platformdata.is_complete(core_datum)
    assert platformdata.validatum(core_datum)

    assert core_datum == platformdata.parse_datum(core_dict)
    platformdata.errors = 100
    with pytest.raises(IndexError):
        _ = platformdata.parse_datum(core_dict)

    assert platformdata.cache == []
    data = [core_dict]
    platformdata.parse_data(data=data)
    assert platformdata.cache == [core_datum]
