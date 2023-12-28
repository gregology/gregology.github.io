---
title: "Generative AI Predictions"
author: Greg
layout: post
permalink: /2023/12/generative-ai-predictions/
date: 2023-12-27 09:41:25 -0500
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
  - news
  - predictions
---

The potential of Generative AI goes far beyond Large Language Models (LLMs like ChatGPT) being able to answer trivia questions, write generic essays, and code using established patterns. The true value of Generative AI is its ability to organise information and then reason.

## Extracting semantic information and reasoning

Generative AI models can extract semantic meaning from documents. Document types include;

- text (articles, chat conversations, etc)
- images (photos, x-rays, scanned documents, etc)
- audio (voicemails, soundscapes, heart beats, etc)
- video (TV shows, live footage, dash cams, etc)
- numerical (server logs, medical results, etc)
- timespace (coordinates, timestamps, etc)
- multimodal (a mix of model types; a video with coordinates and a timestamp, an image with a description, etc)

Consider the task for collecting an individual's tax deductible receipts. Receipts could be text documents in the form of an SMS message, image documents from photographed receipts, or multimodal documents from PDFs attached to emails. A generative AI model with access to the individual's SMS messages, photo library, and email inbox could read each document, extract the semantic information, and reason if each document is a tax deductible receipt. This use case will save humans millions of toilsome hours each year.

## Predictions

### Teaching the news

Journalists access primary sources (press releases, interviews with individuals, etc) and generate news stories for an audience. The audience may be the general public in the case of nightly news or more narrow in the case of articles in industry publications. The journalist must make assumptions on what the audience knows in order to efficiently communicate the news.

Consider this [Al Jazeera article about China’s influence in the Solomon Islands](https://www.aljazeera.com/economy/2023/12/5/in-the-solomon-islands-a-us-agencys-struggles-hint-at-chinas-influence). The journalist wrote this story for a global audience and reasonably assumed the average reader might not know that the small nation of the Solomon Islands is in the Pacific Ocean. While useful for the average reader, this additional context is inefficient for readers familiar with the Solomon Islands.

I'm a part-time acrobatics teacher with Diana, my partner. Diana is a teacher by trade and an important lesson I have learned from her is efficiently communicating the information for the student to succeed. In the case of partner acrobatics, it means knowing the level of the student, understanding their learning style, observing where the student can improve, and delivering tailored cues to help the student succeed.

Generative AI can deliver this same level of attention for news delivery. Consider a platform that consumes local town hall meetings, press releases, interviews, social media posts, weather, etc. and critically evaluates the information to effectively communicate the pertinent information for you. For instance:

- Your local councillors are voting on putting a new park 2km from your house. It's unlikely to pass, here is your local councillor's email address
- The car you drive is having a voluntary recall for the seat warmers
- The UN has released new climate change predictions which align with peer reviewed articles from climate experts. However your federal representative continues to refute the findings on social media and received $50K from pro fossil fuel lobby groups in the last 12 months.

In this reality, the journalist role would change from writing articles to conducting interviews, investigative journalism, and designing these news platforms.

### Consciousness via a neural network of concepts

It's unlikely that a generative AI model will gain consciousness any time soon. However, a system using generative AI that extracts concepts from documents, links the concepts together with weighted connection, and uses this knowledge network to reason may achieve a level of consciousness. I will expand on this concept in an upcoming post.

### Generative AI auditing

Generative AI's ability to extract semantic meaning from documents will be useful for identifying previously unnoticed patterns in communications. AI auditing will surface corruption, exonerate individuals, and rewrite history.

## Local generative AI

Locally run generative AI models like [Mistral's Mixtral](https://mistral.ai/news/mixtral-of-experts/) are preforming well at reasoning tasks. Mixtral running on my gaming PC correctly answers the *if it takes 3 hours for 3 towels to dry, how long does it take for 9 towels to dry* question which demonstrates high reasoning skills.

```json
{
    "model": "mixtral:latest",
    "created_at": "2023-12-28T02:39:18.966611317Z",
    "messages": [
      {
        "role": "user",
        "content": "If it takes 3 hours for 3 towels to dry outside, how long does it take for 9 towels to dry outside?"
      },
      {
        "role": "assistant",
        "content": " Given that drying conditions are similar, we can apply the same time duration for drying 9 towels as it took for 3 towels. This is because the drying process happens concurrently for all towels rather than sequentially. Therefore, if 3 towels take 3 hours to dry, then 9 towels would also take 3 hours to dry under the same conditions."
      },
    "done": true,
    "total_duration": 9265104510,
    "load_duration": 975707,
    "prompt_eval_count": 39,
    "prompt_eval_duration": 1940182000,
    "eval_count": 83,
    "eval_duration": 7322496000
}
```

This completely local process ran in 7 seconds and cost less than $0.0001 in electricity. Subscription cloud generative AI platforms like OpenAI's ChatGPT may succeed however advertising funded platforms like Microsoft's Bing will struggle as interactions with Bing basically become conversations with a salesperson.

## Frameworks

Using existing open source models it is possible to develop all the frameworks outlined in this blog post. However, open source models will continue to improve with better reasoning abilities, larger context windows, and increased efficiency.

## Dangers of generative AI

It's important to highlight the dangers of generative AI. 2024 is an election year in the United States and we are likely to see further weaponization of generative AI. Tools already exist to maintain trust online. For instance, public-key cryptography where a private key can authenticate a message was written by a particular authour. In fact, this blog post is signed using public-key cryptography. In order to impersonate me, an attacker would need to access my securely held private key[¹](/2022/03/trust/). Unfortunately these tools are not widely adopted or understood. No politician or organization should be making public statements without using public-key cryptography irregardless of the threats of generative AI. Generative AI is just an accelerator of the existing threats.
