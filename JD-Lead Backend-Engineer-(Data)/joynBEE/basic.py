from platforms import Jira, Notion, Slack
from analysis_primitives import CorpusAnalyst, Corpus, PlatformData, Temporal
import logging

logformat = "%(asctime)s : %(levelname)s : %(name)s : %(message)s"
logging.basicConfig(level=logging.DEBUG, format=logformat)


def assign_data_platform(platform: str) -> PlatformData:
    """
    Returns a platform-specific Data class instance

    :param platform str: name of platform whose Data class to return
    :raises NotImplementedError: if an unknown platform is submitted
    """

    normalized_platform = platform.title()

    match normalized_platform:
        case "Jira":
            data_platform = Jira
        case "Notion":
            data_platform = Notion
        case "Slack":
            data_platform = Slack
        case _:
            raise NotImplementedError(
                f"""No Data class encoded
                                      for platform {platform}"""
            )

    return data_platform()


def assemble_corpus(platform_list: list[str]) -> Corpus:
    """
    Given a list of platform names, collects and parses
    data for each, then aligns in a single Corpus instance.
    """

    cor = Corpus()
    # assemble data_list
    data_list = []
    for pname in platform_list:
        pinstance = assign_data_platform(pname.lower())
        pinstance.parse_data()
        data_list.append(pinstance)
    cor.align_data(data_list=data_list)

    return cor


def analyze_corpus(corpus: Corpus, analyses: list[CorpusAnalyst]):
    """
    For a given Corpus instance, perform all analyses by
    array of Analysts submitted.
    """

    reports = []
    for analyst_class in analyses:
        analyst = analyst_class()
        analyst.analyze(corpus)
        reports.append(analyst.results)

    return reports


def generate_output(paired: list[tuple]) -> str:

    output_list = []

    for a, r in paired:
        out = f"\n{a.__name__}"

        for key in r.keys():
            vals = r[key]
            row = f"\n\t{key}: {vals}"
            out += row

        output_list.append(out)

    return "\n".join(output_list)


def main():

    logger = logging.getLogger("joynBEE")
    platform_list = ["jira", "notion", "slack"]
    corpus = assemble_corpus(platform_list)

    analyses = [Temporal]

    results = analyze_corpus(corpus=corpus, analyses=analyses)
    paired = zip(analyses, results)
    output = generate_output(paired=paired)
    logger.info(
        f"""The following findings have been generated
        for this corpus of data from {platform_list}:
        {output}"""
    )


if __name__ == "__main__":
    main()
