### 🧹 Task 2: Prototype for Data Cleaning and Contextual Analysis
**Here’s what to do:**
- Whip up a Python script to simulate extracting, cleaning, and performing a basic contextual analysis of provided sample data (see `dataGen` folder).
- Make sure your script is robust by including error handling and data validation.

**What to turn in:**
- 💻🐍 Python code with clear comments.
- 📃 A README that guides us through your script operations and the flow of data.

# JoynBEE (Back End Engineering)

## To Run

To run the report, run `basic.py` from within the defined environment. Keep reading for more specifics.

If you want to run the tests, you'll still need the environment, but can then just navigate to `tests` and run `pytest`. I recommend adding some flags for visibility into testing process like so:


```
pytest -vv --log-cli-level=INFO
```

## Environment & Dependency Management

### To set up poetry env

1. [Install poetry on your system](https://python-poetry.org/docs/#installing-with-the-official-installer)
2. Navigate to the `JD-Lead Backend-Engineer-(Data)` directory and run `poetry install` to create the environment
3. Run `poetry shell` so commands are executed in the environment

I've used poetry here for its underlying use of pip (no conda installation), and convenient packaging. If you are using VSCode to inspect and run files and have Python extensions, be sure to click the version of Python in the lower right of your VSCode pane and make sure that the version from the joynbee Poetry environment is the one being used (otherwise, you will get a lot of misleading angry red lines in files).

### Secrets

I've included an example secrets.json file that you'll need to provide at least a COHERE_API_KEY value to in order to run the live tests that talk to langchain.


## Code Structure

This code is built as a series of interacting modular classes. I have imposed boundaries on them that reflect both how I think and what I believe to be reasonable in the business context I am imagining for their use. While it is by no means perfect, I hope the gist is clear. 

### Primitives

In `analysis_primitives.py`, you can see classes for the different combinations of data coming in from a source. These are intended to be quite generic, such that they can be extended in child classes to meet a number of different analytical needs, while remaining interoperable. Principally, there are three different tiers of organization, each delineated by a different categorical boundary:

- CoreDatum: a single entry of data, in the context of the generate ddata, a shared shape representation of a single valid JSON dict message from a single source.
- PlatformData: a platform(source)-bounded collection of CoreDatum objects, including logic particular to the platform to transform its messages into CoreDatum instances.
- Corpus: a platform-agnostic combined body of CoreDatum instances, at which level analysis is intended to be performed (any analysis over contributing PlatformData objects is intended to be performed in the context of its fellows)

This file also contains a few custom errors indicative of problems with ingestion (missing fields, other oddities).

### Platforms

`platforms.py` houses platform-specific definitions of child classes of `PlatformData` from the primitives file. In time, it's quite likely that more functionality per-platform would arise, occasioning separate directories for each, but for the scope of this exercise, they are all together.

Even within the scope of this task, I found the platforms do not have attributional parity. The logic in `platforms.py` includes enrichment for those not having a single unique ID field, extraction of the quite funkily encoded epoch timestamp from Slack's `ts` field, and some other goodies I discovered as I went through the data.

**NOTE**: there are several points at which I made design decisions myself (what identifier to capture about a platform user, for instance) that I would normally have made in concert with other project participants or stakeholders. 

### Tooling (Basic.py)

`basic.py` is where the assembly and analysis tools are for the cross-platform corpus. It draws from the primitives and platforms, using a crude plugin method to assign and populate appropriate `PlatformData` instances for the defined platforms, then assembles a `Corpus` across them and performs a quick analysis of activity over time.

The corpus here, due to its randomized generation, does not reflect patterns I would usually like to investigate in the context of an analyst, but volume of activity over users and platforms and time is a reasonable enough thing to want to know about, and it provides a use case through which to see how the pieces of this code are supposed to work together.

## NOTES and TODOS

If I were to do this again, I would probably have spent more time manipulating the data generation script to create a corpus more similar to what I believe reality would generate: 
- smaller number of users per platform with consistent text across them
- more varied types of messages per platform - though I suppose that can be controlled on ingestion, I would have loved to see what I could do with JIRA ticket *comments*, not just story descriptions.

This said, I appreciate the convenience of the dataGen tooling provided, and hope that my response to it offers some value and insight.

### TODO

As always, there are things left undone:

- more robust data validation (not just missing data, but malformed)
- more robust analysis (answering a proper business question, more useful outputs like visualization, e.g.)
- more testing (more unhappy-path tests, mocks for expensive operations, more branches of implementation tested)
- more appropriate ingestion (from live API, e.g.)
- deployment & orchestration