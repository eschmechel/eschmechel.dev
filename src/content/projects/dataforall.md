---
name: dataforall
tier: featured
order: 4
when: Feb 2026
status:
  - { text: 'Hackathon · HTC 2026', tone: accent }
  - { text: 'Infrastructure lead', tone: muted }
tech: [Python, FastAPI, Kubernetes, Docker, Lambda Labs, PostgreSQL, S3]
links:
  - { label: repo, href: 'https://github.com/LMSAIH/htc2026' }
  - { label: devpost, href: 'https://devpost.com/software/data-for-all' }
highlights:
  - Scaled a distributed training backend to 4 Kubernetes replicas with secrets management, a container registry and multi-region load balancing; provisioned H100s via the Lambda Labs API
  - Reclaimed idle GPU spend ($3.29/hr per H100) with worker lifecycle management — heartbeats, stale-instance detection and auto-cleanup
images:
  - { src: '../../assets/projects/dataforall-hero.webp', alt: 'DataForAll landing — "AI models that work for people"' }
  - { src: '../../assets/projects/dataforall-missions.webp', alt: 'Missions dashboard with contribution chart' }
verified: true
source: HTN resume (2026-07)
---

A distributed GPU training platform, where I led the infrastructure. Crowdsourcing the ability to submit, annotate, and train on opensource datasets.
