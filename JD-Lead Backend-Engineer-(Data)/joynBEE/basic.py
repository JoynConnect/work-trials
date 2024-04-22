from joynBEE.platforms import Jira, Notion, Slack
from joynBEE.analysis_primitives import CorpusAnalyst, Corpus, Data, Temporal


def assign_data_platform(platform: str) -> Data:
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
            raise NotImplementedError(f"""No Data class encoded
                                      for platform {platform}""")

    return data_platform()


def assemble_corpus(platform_list: list[str]) -> Corpus:

    cor = Corpus()
    # assemble data_list
    data_list = []
    for pname in platform_list:
        pinstance = assign_data_platform(pname)
        pinstance.parse_data()
        data_list.append(pinstance)
    cor.align_data(data_list=data_list)

    return cor


def analyze_corpus(corpus: Corpus, analyses: list[CorpusAnalyst]):

    reports = []
    for analyst_class in analyses:
        analyst = analyst_class()
        analyst.analyze(corpus)
        reports.append(analyst.results)

    return reports


def main():

    corpus = assemble_corpus(platform_list=["jira", "notion", "slack"])

    analyses = [Temporal]

    _ = analyze_corpus(corpus=corpus, analyses=analyses)


if __name__ == "__main__":
    main()
