---
title: "Generative AI framework to grow thinking agents"
author: Greg
layout: post
permalink: /2024/01/generative-ai-framework-to-grow-thinking-agents/
date: 2024-01-03 23:00:00 -0500
comments: True
licence: Creative Commons
categories:
  - technology
tags:
  - generative-ai
  - llms
  - gpt
  - chatgpt
  - llama
  - self-learning
---

The true value of Generative AI is its ability to organise information and then reason. This is a proposed self improving framework using Large Language Models, LLMs like ChatGPT and Mixtral.

Generative AI is predicting what should come next and is unaware of concepts. For instance, generative AI image models do not have a concept of a human hand. The models predict that a finger-like structure is normally next to another finger-like structure so they often create hands with too many fingers. Increasing the context window will help reduce these kinds of errors but it does not address the fundamental problem, the model is unaware of the concept of a hand. This project will use generative AI's semantic extraction and reasoning abilities to build a concept aware auditable AI framework that can learn, think, and improve itself.


# Design

This is my current suggested approach but expect this to evolve during prototyping. We will need to design the APIs or adopt an existing standard. The scope of this proof of concept will be limited to text however design decisions should assume we will be using multimodal models in the future.


## Semantic network

A semantic network will be concepts stored within a graph-based data structure and accessible via an app with an API to interface. Each semantic network will be atomic for a specific subject, for example, a Python coding semantic network or a semantic network based on your email inbox. A Python coding semantic network may be read-only and publicly accessible while your email inbox semantic network would be read/write and private. The concepts and relationships will be added to the semantic network via an orchestrator.


## Ability

An ability is an app with an API interface that can do a specific task. For instance, run python code and return the results, extract emails from an inbox via imap, create a GitHub pull request on a repo, use the internet to answer a question, or ask a specific human a question via Slack. Ideally, we can create an ability that can generate pull requests to create new abilities, improve existing abilities, and improve the orchestrator (most importantly improving prompt and case statement efficiency).

We will create a researcher ability first. This ability will know where to search for specific information online, for instance, if you query a researcher ability for the current prime minister of Canada, it may search the internet, find an answer on Wikipedia, check the primary source, validate that the linked primary source is legitimate, and then return the answer along with the source. A researcher will also be able to return relevant documents for a specific concept, for example, if you query a researcher ability for documentation on Python coding, it will need a way to reason where accurate documentation exists, hopefully determining that sources like docs.python.org, docs.python-guide.org, the Wikipedia articles for Python_(programming_language), and the top 1000 packages on pypi.org are legitimate. Then, where licencing permits, scrape those sources and returning the documents (the orchestrator could then process these documents to grow a semantic network).


## Orchestrator

The orchestrator is an app that interacts with humans, semantic networks, and abilities. When the orchestrator receives a human interaction, it will use generative AI to extract the semantic meaning from the interaction, determine if any of its semantic networks or abilities are related to the query, and then generate tasks to action the interaction.

The orchestrator will continuously improve its semantic networks by acquiring new information with the researcher abilities and updating/creating connections between concepts in semantic networks. The orchestrator can have ongoing tasks using abilities, like improving its own code base. However, interactions with humans will be a priority task.

Unlike queries directly against LLMs, the orchestrator will be inquisitive and proactive. It will be far more humble and willing to ask clarifying questions and admit ignorance. Using abilities, it may also proactively ask humans questions via Slack, for instance, asking whether a specific source it has found contains accurate information and then updating its semantic network with this new information. The orchestrator actions will be auditable as the LLM prompts it produces and responses will be logged. Hallucinations will be far less likely as the LLM prompts the orchestrator produces will be structured with appropriate context.


### Example orchestrator interaction

As a simple example consider the orchestrator receiving this query from a human "who is the current prime minister of Canada?". The orchestrator will programmatically generate a prompt for an LLM using knowledge of its available semantic networks and abilities to determine how best to proceed.

```prompt
"who is the current prime minister of Canada?".
Return a JSON blob that answers the following questions about this chat message with confidence scores from 0 to 1 using a precision of 0.01;
 - single_question (does this chat message contain a single question?)
 - multiple_questions (does this chat message contain multiple questions?)
 - clarifying_questions (does this chat message require clarification?)
  ...
 - python_semantic_network (does this chat message relate to Python coding?)
 - online_researcher_ability (does this chat message contain a question that can change over time?)
```

```response
{
  "single_question" : 1,
  "multiple_questions": 0,
  "clarifying_questions": 0,
  ...
  "python_semantic_network": 0,
  "online_researcher_ability": 0.99
}
```

Using the response and case statements the orchestrator will;

* create a task to respond to the human informing them that they are currently researching the question
* create a task to pass this message to its online research ability (with listener)
* create a listener that waits for the online research ability tasks to finish and then responds to the human

The reasoning logic occurring during these interactions is logged and the framework's decisions are auditable. 


# Technology


## Models

This framework will be LLM agnostic, capable of running on local or cloud models and be easily portable to new LLM offerings. For most reasoning tasks the orchestrator should use efficient LLMs with high reasoning abilities. Currently for reasoning skills the best locally hosted offering is [Mistral's Mixtral](https://mistral.ai/news/mixtral-of-experts/) and the best cloud hosted offering is OpenAI's ChatGPT 4. We can use [Ollama](https://ollama.ai/) as an interface for local models and OpenAI API for cloud models.


## Implementation

_My current choices for the tech stack are weakly held opinions, please make cases for alternative stacks. I am suggesting using Python and Flask where possible as it is lightweight and simple which will make it easier for the framework to understand and self-improve._

We will use Docker for containerization. A deployment will consist of a single orchestrator app with multiple semantic networks and abilities.

A **semantic network** will consist of a simple API app and a graph-based database. Semantic network APIs will expose a documentation endpoint designed specifically for efficient ingestion by LLMs. The documentation endpoint will contain details about what is stored within the semantic network. Semantic network APIs will allow the orchestrator to retrieve documents and relationships. When the semantic network allows write access the semantic network API will also allow the orchestrator to insert documents and create relationships. We will use Flask for the API app and Neo4j as the graph-based database. The optimal graph-based database to use will depend on the size and relationships of the concepts being stored.

An **ability** will be an app with an API. Ability APIs will differ depending on their use case but all ability APIs will expose a documentation endpoint designed specifically for efficient ingestion by LLMs. The orchestrator will use the documentation endpoint to craft API calls to the ability. The code / framework choice will be dependent on the task. Specific abilities may consist of multiple docker containers, for instance, an online researching ability may have an associated [SearXNG](https://github.com/searxng/searxng) instance for querying the internet.

The **orchestrator** will be an app with either an API or chat interface that is capable of running queued tasks. This will likely be a simple Flask app using Celery and Flower with PostgresSQL & Redis. 


# Development plan

* Create semantic network API
    * Workout what weight dimensions are useful for v1
    * Workout how to best document what knowledge is accessible within the semantic network for the documentation API endpoint
        * This will include optimised versions for specific LLMs
    * Generate versioned API structure for inquire / teach operations (aka read / write operations)
* Ability documentation API endpoint
    * Workout how to best document how to craft API calls for documentation API endpoint
        * This will include optimised versions for specific LLMs
* Create semantic network app
    * Create a simple Flask semantic network app using previously designed API
    * Dockerize the Flask app with graph-based database
* Create some ability apps
    * Researcher ability
        * Create an ability that can search the internet, validate sources, and return results with confidence
    * GitHub ability
        * Create ability that can read repo details, pull requests, commits, and create pull requests
    * Python / Flask ability
        * Create ability that can run a Flask apps test suite and return errors
        * Create ability that can deploy and test a Flask app in development environment and return any errors
* Create Orchestrator Flask app
    * Event queue (using Celery and Flower for monitoring)
    * Chat interface (Slack? Ideally this app could proactively reach out with questions when it is unsure about something)
    * Task pattern (a single chat message may trigger multiple API calls to semantic networks and abilities)
    * Dreaming tasks (background tasks that run to improve relationships in existing semantic networks)
    * Training functions
* Train some semantic networks
    * Using the researcher ability, train a Python coding semantic network and make it publicly available
    * Using the GitHub ability, train a semantic network based on the orchestrator code base
* Instruct the orchestrator to improve its own code base and create pull requests
* Skynet ¯\\\_(ツ)_/¯


# Open questions

* Is Flask the best stack for the orchestrator app?
* Should an ability be able to alter a semantic network directly or should everything be done via the orchestrator?
* What risks are associated with creating this and how can we mitigate dangers?
* What safety measures and canaries should we implement?
* How should we be testing our frameworks for biases?
* What should we focus on for the proof of concept?
* Should personality be an attribute of the orchestrator or be abstracted and accessed via an API?


# Further research links

* [Ollama](https://ollama.ai/), see what [new models are available](https://ollama.ai/library?sort=newest) and have a play locally
* [Graph databases](https://en.wikipedia.org/wiki/Graph_database) and [Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language))
* [Prompt engineering](https://en.wikipedia.org/wiki/Prompt_engineering)
* [Mistral's Mixtral](https://mistral.ai/news/mixtral-of-experts/)
