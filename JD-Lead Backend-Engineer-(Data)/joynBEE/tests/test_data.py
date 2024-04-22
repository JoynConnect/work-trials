import joynBEE.analysis_primitives as ap
import pytest


@pytest.fixture
def core_datum():
    return ap.CoreDatum(
        "testing_platform",
        "fake_id",
        "update_time",
        "low",
        "open",
        ["fakey McFakerson", "Bob"],
        "Lorem ipsum doesn't even start with a whole word!"
    )


def test_coreDatum(core_datum):
    return
