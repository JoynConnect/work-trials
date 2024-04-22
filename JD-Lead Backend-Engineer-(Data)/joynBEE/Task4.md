### 🔍 Task 4: Quick Implementation Using Langchain
**Challenge time:**
- Show us a quick implementation using Langchain to boost a particular aspect of your data pipeline, emphasizing how it can generate insights or aid data operations.

**What to turn in:**
- 🖥️🐍 Python source code for your implementation.
- 📘 A short guide or document explaining the benefits and application of Langchain in your proposed setup.

## Overview

The tooling I've put together can be found in `langtools.py`, where classes for creating embeddings for a variety of analytical tasks (see `textanalysis.py`) and a RAG apparatus from a given Corpus can be found. You can see them work by running the `test_lang.py` test file. Unfortunately, in terms of RAG, the content of the corpus is a bit difficult to query as is, but I've provided a query that has had nonzero results returned from the generated corpus. If there were more time, I would revisit the interfaces I've created, as I think textanalysis and langtools could be refactored more elegantly, but I have to stop sometime, alas.

I chose to implement a cross-platform single corpus (with a fair amount of metadata) embedding model and vectorstore for this task, as it reflects the business ask I understand to motivate it, and can be disassembled fairly easily (at this scale, anyway! Might need to revisit for larger corpora) for different subtasks.

## Pipeline

My implementation of RAG builds on the classes implemented for Task 2, and would be homed in the Lambda/ECS logic layer of the proposed architecture from Task 1. In terms of the document and vectorstores it assigns and interacts with, my local implementation does not include usage of a SQL db to store documents or vectors, but it should be a fairly straightforward swap with langchain APIs (though it would require further splitting the setup methods to allow embedding, model, and vectorstore to vary independently). Depending on latency requirements, I would think and hope that a streaming loader similar to the one written [here](https://github.com/lovering810/plumbingbird/blob/main/etl/loaders/postgres_loaders.py#L66) would be lightweight and fast enough to serve. Additionally, minimal changes are needed to apply this logic to a streaming input (once the corpus vectorstore is established).

As a result of langchain additions, I added the ability to make itself into a langchain Document to the CoreDatum class, for embedding and vectorization. This means that while the current implementation only ingests the static corpus from file, a future such one could ingest a stream of platform-specific messages, make each into a CoreDatum instance, and add it to the index of the vectorstore. This can helpfully scale horizontally for ingesting new info and making it easily available to the agent.

While I am not satisfied with the precise configuration (prompt tailoring, context constraint, metadata filtration, etc.), I am decently pleased with the *configurability*. I think that with more time, I would iron out some important kinks. For instance, while I have not implemented it, I would like to explore Ensemble retrievers to better exploit the metadata the CoreDatum Document creates and retains.

## Utility

In addition to making RAG available, I've also made an MDM tool (Master Data Management) to retrieve likely candidates from across platforms to correspond to a given human user.

While this would hopefully be a single-use application, I've implemented vector search for coreference resolution (that is, figuring out who's who across platforms, based on how they write). My code takes all that a user has created on a single platform and looks at the other platforms' document vectors to see which are most similar. Based on the authorship of the most similar documents, it assigns likely other-platform membership for the source user across all platforms present in the corpus. While this could definitely be reworked to create smaller corpora, one for each user per platform, and searched accordingly, I found it more expeditious to embed each platform and search across the whole, filtering the results post-hoc. I would need to experiment to see which is more appropriate in the field.

This approach may not prove out with real texts (it certainly doesn't have enough to go on in the small generated corpus), but it lays the groundwork for any dynamically set corpora comparisons. This can be used with any arbitrary filtration criterion (not just ownership), like looking for the most confusingly written documents or those with an emotional valence (though this is pretty fraught in terms of the science).