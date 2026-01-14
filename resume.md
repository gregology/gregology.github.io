---
layout: page
redirect_from:
  - /cv/
  - /cv
  - /résumé/
  - /résumé
comments: False
signed: True
licence: Creative Commons
title: Résumé
clippy_help: It looks like you're trying to hire Greg. Consider paying him in cheese 🧀 It's his favourite food!
---

## Summary
Staff engineer building AI-assisted developer tooling and infrastructure automation.  
I ship prototypes quickly, harden them with validation loops and measurements, and make them usable through docs and clear interfaces.  
Comfortable operating across LLM tooling, cloud APIs, networking, and production guardrails in remote-first teams.

## Selected Work (high impact)
- **Async AI workflow orchestrator (triage -> implement -> assess):** built a multi-stage automation system that runs steps asynchronously, preserves context across phases, and uses heuristics to decide when to escalate to a human for guidance.
- **AI code reviewer that improves code quality over time:** built an internal review system that evaluates changes against *human-authored guidelines* and uses challenge/verification mechanisms to reduce hallucinations, keeping suggestions actionable and preventing the codebase from "regressing to the mean".
- **LLM-powered dbt model optimizer with fail-fast validation:** built a tool that proposes SQL optimizations, tests them against sampled datasets to catch issues quickly, and feeds concrete failures back into the LLM to iteratively repair until results reconcile.

## Technical Skills
**Core**
- **Languages:** Python, SQL, Bash, Ruby
- **Infra:** Linux, Docker, networking fundamentals (DNS/routing/firewalls), Nginx
- **Cloud & Platforms:** GCP, AWS, Cloudflare, Tailscale
- **Data:** dbt, Spark, BigQuery, warehouses at scale
- **AI/LLM systems:** LLM integration patterns, tool/agent workflows, validation loops, evaluation harnesses, context/prompt design  
  **Serving & runtimes:** vLLM, Ollama, llama.cpp
- **Ops & delivery:** CI/CD (GitHub Actions / Cloud Build), basic observability patterns
- **LLM tooling:** LiteLLM, MCP servers, structured outputs / tool calling patterns

**Working knowledge (used in projects; not primary)**
- **Languages:** Go, TypeScript, JavaScript
- **LoRa:** Meshtastic, LoRaWAN
- **Microcontrollers:** ESP32s, Raspberry Pis, PCBs

**Identity & Security (practical)**
- OAuth/OIDC concepts, service accounts & IAM, least-privilege access, RBAC/ABAC concepts

## Experience

### Shopify - Canada (Remote) (Jul 2019 – Present)

#### Staff Engineer, Data Warehouse Technology (Sep 2025 – Present)
- Built an **LLM-powered dbt optimization tool** that fails fast on sampled data, validates semantic equivalence, and iterates automatically by feeding execution/validation failures back to the model.
- Improved reliability by adding validation gates for AI-generated changes (language-aware checks, clearer failure states, and safer automation defaults).

#### Senior Machine Learning Engineer (Dec 2024 – Sep 2025)
- Built an **async AI automation orchestrator** for data engineering workflows using a staged approach (triage -> implement -> assess) with **human-in-the-loop escalation** driven by heuristics and confidence checks.
- Built an **AI code review system** that reviews changes against **human-authored engineering guidelines**, using challenge/verification techniques to reduce hallucinations and making suggestions one-click apply in GitHub.

#### Senior Analytics Engineer (Feb 2023 – Dec 2024)
- Migrated core warehouse workloads from Spark to dbt on GCP.
- Improved modeling practices, review workflows, and operational consistency across a large shared codebase.

#### Senior Data Scientist (Jul 2019 – Dec 2021)
- Led a small team delivering forecasting and infrastructure planning recommendations.
- Developed tooling to make load balance recommendations for our core infrastructure.

#### Parental Leave (Dec 2021 – Feb 2023)
- Learned how to make a small human happy.

### CEO & Founder - Memair (Nov 2018 – Jul 2019) - Ottawa, Canada
- Built a personal analytics product end-to-end (backend, frontend, infra, and ops).
- Worked across Rails, Python, GraphQL, React, Flutter, and JavaScript on cloud + self-hosted infrastructure.
- Site: https://memair.com

### Sailing Sabbatical (Sep 2017 – Sep 2018) - Canada/USA/Bahamas
- Sailing [SV Catsaway](https://SVCatsaway.com) from Kingston, Ontario, to the Bahamas and back.
- Produced a [YouTube series](https://YouTube.com/SVCatsaway) documenting our adventure, honing video communication skills.
- Hacking on a few (mostly boat-related) [projects](/packages).

### Data Engineer - Shopify (Sep 2013 – Sep 2017) - Ottawa, Canada
- Data modeling, reporting, experimentation, and ML support for early Shopify.
- Worked primarily in Python/Ruby with Spark, Presto, and Rails.

### Data Specialist - Amnesty International (Mar 2012 – Sep 2013) - Sydney & Ottawa
- Supporter database projects; Rails + SQL; operational reporting and process improvement.

### Communications - Australian Army (Jul 2004 – Nov 2012)
- Peacemaking tour in [Afghanistan](/2020/07/publishing-afghanistan-posts/) 🇦🇫.
- Peacekeeping tour in [Solomon Islands](/2009/02/tongans-belgiums-and-the-jungle/) 🇸🇧.

### Instructor • Upward Dog Yoga Centre (Jul 2014 – Mar 2020) - Ottawa, Canada

* Teaching Acroyoga as part of [SmileyOm](https://smileyom.com).

## Projects & Self-Hosting
- Home lab: servers, Docker workloads, monitoring, backups, and secure remote access.
- Self-hosting (incl. Mastodon) and home automation (Home Assistant / ESP32).

## Writing & Speaking
- Speaker: AI Tinkerers Toronto (Nov 2025) and many internal Shopify communications.
- [Blog posts](https://gregology.net/posts/).

## Open Source & Patents
- [Packages](https://gregology.net/packages/) (Python/Ruby/npm; mixed recency)
- [Patents](https://gregology.net/patents/)

## Education
Bachelor’s Degree - Murdoch University (2008 – 2011, Remote)  
Focus: security / terrorism / counter-terrorism

## Security Clearance
- Canada: Enhanced Reliability (valid through 2029)
- Australia: Top Secret (lapsed)

## Citizenships

🇦🇺 Australian  
🇨🇦 Canadian  
🇮🇪 Irish (🇪🇺EU)  
🇬🇧 British  

## Principles
- Improve the world according to my [Codex Vitae](https://gregology.net/codex/).
- Use AI & data to solve interesting problems.
- Lead great teams; keep learning; avoid being the smartest person in the room.

## Home Office

Connection:  
 - 3Gbps ⬆️⬇️ fiber Internet  
 - Ubiquiti networking equipment with ethernet to office  
 - 5G cellular & 1hr UPS redundancy

Residence: [Prince Edward County, Ontario, Canada](https://goo.gl/maps/EkoPgT1Gz5cgUcTg6)  
 - 🏢 10mins to co-working spaces  
 - 🚗 15mins to 401 highway  
 - 🚊 15mins to Belleville Via Rail station  
 - ✈️ 2hrs to Toronto Pearson International Airport

Timezone: [Eastern Standard Time](https://time.is/EST) (UTC−05:00)  
Workable hours:  
 - **PST:** 04:00 - 13:30 PST  
 - **EST:** 07:00 - 16:30 EST  
 - **UTC:** 12:00 - 21:30 UTC  
