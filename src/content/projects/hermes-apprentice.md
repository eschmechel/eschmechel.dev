---
name: hermes-apprentice
tier: featured
order: 2
when: May 2026
status:
  - { text: 'Winner · Hermes Agent Challenge', tone: win }
  - { text: 'Open source', tone: muted }
tech: [Go, Python, Unsloth, vLLM, ONNX, Prometheus, Grafana]
links:
  - { label: repo, href: 'https://github.com/eschmechel/hermes-apprentice' }
  - { label: writeup, href: 'https://dev.to/eschmechel/skills-are-prompts-heres-how-hermes-apprentice-turns-them-into-weights-59eh' }
  - { label: devpost, href: 'https://devpost.com/software/hermes-apprentice' }
highlights:
  - Cut recurring agent inference from multi-second upstream API calls to ~38 ms p50 local latency by distilling matured task patterns into 18 MB QLoRA specialists served on vLLM
  - Gated every specialist behind a held-out F1 test and a 5%→100% canary ramp that auto-demotes on agreement drop
  - Automated pattern discovery from agent session logs with a Go observer, BGE-small ONNX embeddings and HDBSCAN clustering
images:
  - { src: '../../assets/projects/hermes-p95.webp', alt: 'Grafana: specialist p95 4.77 ms vs upstream p95 47.0 ms' }
  - { src: '../../assets/projects/hermes-1.webp', alt: 'Apprentice demo run: detect, build dataset, train, validate, promote' }
  - { src: '../../assets/projects/hermes-2.webp', alt: 'Grafana latency panel: specialist p50 2.5 ms vs upstream' }
verified: true
source: HTN resume (2026-07) + dev.to writeup
---

A second learning loop for Hermes Agent: it spots patterns the agent keeps handling, fine-tunes a
small specialist on them, validates it, and routes future matches to a free local endpoint.
