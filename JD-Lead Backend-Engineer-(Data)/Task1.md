### 🛠️ Task 1: Design a Simplified Data Pipeline
**Let's get started:**
- Your challenge is to create a basic but scalable data pipeline using AWS services to process and store data from a single source into PostgreSQL.
- Think about scalability: Outline how this setup could be expanded, including the integration of vector databases for advanced needs.

_________________________________________

## Assumptions

In this as with any design, there are a few assumptions at work: 
- we want to balance cost with functionality 
- we have able engineers to build *and maintain* when we don't buy
- "basic" and "simple" should be interpreted as "atomic" and "low-level", rather than "fewest boxes in diagram = best"

## Overview and Alternatives

As table stakes in the AWS ecosystem, all resources are diagrammed and expected to exist in a VPC (Virtual Private Cloud) to protect access and data in-system. A few auxiliary tools that are left out are things like CodeBuild and Secrets Manager, which would be the same across the included options and have more to do with infrastructure engineering and CI/CD.

In all cases, the data store proposed is RDS Postgres. I've chosen this over, say, Redshift or Aurora for its cost-effectiveness, but there are business conditions in which the need for lower latency could make Aurora more attractive, or in which a lack of data engineering support would make Redshift more attractive (for its burgeoning ecosystem of off-the-shelf ingestion tools). Both Aurora and RDS flavors of Postgres support the `pgvector` extension, which lets Postgres operate as a vector store, which is another reason I went with RDS for this exercise, to keep things smooth for the putative downstream transition in the task setup. 

If we were not constraining the exercise to Postgres, I might advise use of AWS Neptune, for its graph-based tooling and langchain integration.

### Poll vs Event-driven

I've considered two different scenarios: batch and streaming (or polling - in which we dictate when we pull data from outside - and event-driven - in which we respond to the external source pushing data to us). In each case, we need a way to receive new information, decide what to do to it, and load the result to our own data store. The classice ETL! (While there is an alternative ELT version, I have decided not to pursue it as it adds complexity and risks overload in ways that can be mitigated upstream by doing processing before data lands in the Postgres instance, and may not survive a transition to vector storage).

### Processing Power (Lambda/StepFunction vs ECS)

The diagram includes alternatives around the scope of transformation, indicated by brackets surrounding the options.

With sufficiently low latency, data volume, and/or computational complexity, lightweight AWS Lambda is perfectly adequate and a more cost-effective tool for transformation. In such a situation, it would not make sense to incur the additional overhead of ECS. For multi-step transformations in which any one step takes less than 15 minutes, but the whole process takes longer than 15 minutes to execute, a StepFunction (chain of Lambdas) might make sense. That said, Lambdas and StepFunctions require external triggers like CloudWatch, and the access patterns and business rules may make supporting the combination of multiple AWS services less desirable.

ECS includes its own trigger mechanisms and can handle longer-running/more involved processes, whether that comes from larger volumes of data, more complex calculation, or more nuanced hardware configuration.


## Batch Pipeline

In the batch context, we are the ones instigating the data pull on a specific schedule, ostensibly from an API. This can be accomplished with a cron-scheduled CloudWatch Event that triggers a Lambda/StepFunction or natively with ECS Service Scheduler. The frequency with which data is needed to update the system will dictate a number of attributes of the implementation: if we are polling for changes to an external data source, it is reasonable to think that shorter cycles mean less data needs to be processed on each pull, meaning that we might be able to get away with a Lambda versus an ECS Service and Task.

## Streaming Pipeline

In a streaming context, we are responding to events in the external system. A simple way to listen for those is via webhook, which most tools (like Slack) offer. These can be brought into the VPC via the AWS API Gateway, which can then trigger a transformation process in whichever service is most appropriate to the profile of the code that needs to run (see above on Processing Power). 

## Scaling

All the components chosen have straightforward scaling mechanisms. 
- Lambdas scale automatically per request up to 1000 instances (without additional changes to AWS account settings) 
- Stepfunctions also offer auto-scaling of the underlying resources (Lambdas, connections)
- ECS has several different scaling mechanisms: alarm-based (in concert with CloudWatch), schedule-based (for predictable load increases), and target metric (you select a dimension and its triggering value).
- RDS has autoscaling with several configuration options. This is the one to keep the closest eye on, because it's non-trivial to scale *down* if the need reduces (as it may during a development phase in which there's discovery-related flap).

### Multi-pipe Scaling

The components' ability to scale has so far been considered within a single pipeline. In order to scale up by adding new sources, we have a few choices. I'm describing them here as binary, but in reality (as is so often true), these are really part of a spectrum of ways to delineate process boundaries and planes of control.

#### Transformation Code Plugins

If the business logic of the transformation includes coercing a shared target data shape and rough parity in terms of transformation scope, we can accomplish the addition of a new source in code alone (possibly with some added secrets' values, too), by using the plugin pattern and responding to a parameter in the received payload to dictate which logic to apply. In this case, we get to take full advantage of the auto-scaling features of the underlying resources, and need only to deploy that new code to the transform layer.

#### IaC Modularization

The downside of having the transform code expand in breadth is just that: it expands! Depending on the increased scope, it may exceed the reasonable size for a lambda. Additionally, if the same resources are receiving info from different sources, the malfunction of a single source (an explosion of events, e.g.) could over-scale the resources and it would not be possible to shut down or inspect the pipeline belonging only to the offender - it would be all or nothing until a patch could be deployed.

To avoid this unfortunate outcome, we can instead modularize the pipeline's resource definitions with a tool such as Terraform. This adds overhead (independent resources may be spun up at lower loads per-source than with the code plugin option), but also more granular control.
