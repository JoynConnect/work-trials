### 🤖 Task 3: ML/AI Data Infrastructure Outline

## Overview

It's important to note that RAG (Retrieval-Augmented Generation) involves multiple sites whereby data can be fed into the system. There's the language model itself with its particular stylometry for language generation, and the vectorized knowledge base from which information is retrieved. The following proposal is considering the context of a RAG application and will discuss both of these input modalities. There are some other ML contexts that I'll cover if I have space, but I will be focusing on RAG first.

This proposal assumes an approximate balance between building and buying. The needed functionality will be desribed as well as a few options for how to implement it, with more and less management for services. Additionally, I will only consider event-driven ingestion (please see Task1.md for an alternative, pull-based ingestion) for time. The scope of this implementation in a Joyn context is intended to be per-customer - Customer A should not be sharing data resources with Customer B, certainly for knowledge and perhaps for language model, depending on how custom the fine-tuning and pretraining for models are.

## Infrastructure

### Meta Services

What I mean by "meta services" are the tools surrounding the business logic: logging, monitoring, CI/CD, security. These all have representation in the AWS ecosystem and should apply to all the services in which business logic is executed therein. CloudWatch is the logging and monitoring service of choice in AWS, optionally connected to an external log digester like DataDog. CodeBuild triggered by GitHub Actions is an industry-standard implementation for CI/CD. All secrets should be stored with Secrets Manager, accessed by only those services that need them (I prefer feeding them into service containers as environment variables), and all resources should be in a VPC (not exposed to the public internet).

### Ingestion -> Storage

Both the Knowledge Base and the Language Model have overlaps in the data they can leverage, as well as sources that may prove useful to them independently. In both cases, the data needs to be transformed into the most common underpinning for current state-of-the-industry NLP: embeddings, or vectorized representations of text. While I am assuming that SageMaker is the service into which this vectorized data will be ingested and which will power the user interaction enabled by the front end, vector databases are a consistent tool across different NLP and ML/AI setups. 

For any implementation, a record of the input data should be kept, but it need not be exhaustive/a duplicate of exactly what came in. Typically, messages from external APIs include a fair amount of chaff (denormalization into combinations of `field_name` and `field_value`, for instance). I propose an initial transformation (likely possible with a Lambda) to pull out the relevant fields' content based on the source and to determine based on metadata to whom the information should be visible, plus any in-system enrichment (such as a unique identifier across sources). Once this message standardization and streamlining (textual normalization) is complete, the results can be stored in s3. 

From s3, either home-rolled or managed services can pick data up for use in the knowledge base and/or language model. It is important to note that the s3 storage needs to include either metadata that allow the data to be partitioned based on permissions and sensitivity. In addition to being available to any downstream reprocessing, this data set can be used to perform more linguistic analysis to reveal insights. Version controlling this data will also allow us to roll back or recombine input data to the different resources.

#### Managed (Bought)

AWS offers a managed service for RAG through Amazon Bedrock, which contains the transformation of data to vectors and their storage in a vector store that is pre-wired to a language model of your choosing (from an AWS-provided set that does not include OpenAI products at time of writing). You can create and update the knowledge base as well as fine-tune or even pre-train the foundational language models. If this is elected, it constrains the choice of vector store, which may be more expensive and not support as much downstream flexibility. I have not worked hands-on with this tool, so I'm not sure how customizable its behavior is in terms of language model retraining.

#### Developed (Built)

The necessary steps in ingestion can be accomplished by custom alignment of more atomic AWS services, like API Gateway (through which to receive external events), Lambda/StepFunctions/ECS (for transformation), and RDS Postgres (for vector storage). This offers greater granularity of control than a fully-managed solution, and includes more flexibility in terms of implementation of each individual layer. (See Task1.md for more).


## Data Flow

1. Receive payload of data to be used in the knowledge base (API Gateway)
2. Normalize/screen/anonymize/enrich data (Lambda/StepFunction/ECS Task)
3. Store normalized copy (s3)
4. Embed, vectorize, update knowledge base (Lambda/StepFunction/ECS Task)

**Optional**
5. Use persisted data in pretraining/fine-tuning of language model (either vectorized or normalized text).


### Risks & Mitigations

#### Errors

The primary technical risk we want to allay is breaking the pipeline. While we do not accept liability for the quality of inputs to work systems (even the best system cannot escape GIGO), we do need to account for malformed messages/missing metadata. Per source, we want a strong expectation of message shape and content, and we want to enforce it in code. Either by attempting to perform the normalization step to the shared data concept model and catching exceptions or by validating metadata before even starting the normalization attempt, we can enforce data validation at least at the syntactic level. (The semantic level will have to wait for another day.)

#### Access

The primary business risk we are looking to mitigate is that the wrong person will see sensitive information. Examples include things like personal health information (PHI) appearing to any non-provider or a JIRA ticket update in which an employee's credentials are being revoked in a system due to an imminent layoff being seen by the soon-to-be-former employee. These sensitive items can sneak in either from the knowledge base or, unusually but still possibly, from the LLM itself.

The transformation step could include something as robust as summarization of long text or as minimal as flattening a nested dictionary of a small JSON message. Sensitive data can be anonymized at this point. It is a business decision whether to retain a sensitive copy in a sequestered data store, but for safety, I would default to storing only the anonymized copy. This protects from shenanigans coming from either the LLM or the knowledge base.

Specific to the knowledge base, the retrieval mechanism will need a way to know users' various permissions in order to constrain what is returned for prompt augmentation. (This will require some amount of coreference resolution/MDM across source systems, a non-trivial task I recommend performing on setup and as new employee users are added, but whose explicit implementation exceeds the scope of this proposal.)

While it is possible to use an unadulterated LLM from a provider, it's nice to add a more customized voice from the customer corpus. This isn't intended to change the information available to the model, but impact its style of delivery. This means we want to constrain the training data used in fine-tuning or pretraining, likely by both source and specific content triggers.

(In-system access to the wrong data by developers is assumed to be managed according to the principle of least privilege, and handled through DevOps practices.)

#### Staleness

Another risk we want to avoid is retrieved data staleness. To this end, the cadence of batch processing (if that's the selected approach) or resourcing of stream processing needs to be sufficient to meet the query cadence. In 2024, it's probable that a Q&A RAG system is going to want to be as close to real-time as possible. Starting from that expectation, any SLA for data avilability needs to include the time needed for initial normalization/filtering, embedding, and vector storage (this will likely vary by source).

Staleness also involves retrieving temporally relevant information. If a user queries for updates on a program, there's a time window outside of which we should consider either a) rolling off data or b) constraining returned results. In either case, we will want to include time information in the vectorized representation of the data.


## Tech Stack

To implement the back-end business logic I've described (text normalization, updating vector stores with enriched data), I favor Python for its robust set of NLP libraries (spaCy, langchain, pytorch) and boto3 library for interacting with AWS resources. It also enjoys good virtual environment and dependency management, robust support in terms of runtime environments in AWS Lambda, and plenty of container definitions in Docker Hub. 

For defining AWS resources, I favor Terraform, though I hear good things about Pullumi, too. Either solution allows a concrete definition of infrastructure that is repeatable and version-controlled. These attributes allow higher developer quality of life and easier disaster recovery.

For CI/CD, I have had a great time with GitHub Actions, which can be environment delimited and version-responsive (making a draft release can deploy to QA, e.g.), handles secrets securely, and creates a seamless development-deployment pathway.