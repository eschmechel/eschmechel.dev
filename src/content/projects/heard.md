---
name: heard
tier: featured
order: 1
when: Oct 2026
status:
  - { text: 'Hackathon · StormHacks 2026', tone: accent }
  - { text: 'Team of 4', tone: muted }
tech: [TypeScript, React, Python, FastAPI, PyTorch, ONNX Runtime Web, MediaPipe, ElevenLabs, RunPod, Hugging Face]
links:
  - { label: repo, href: 'https://github.com/LMSAIH/stormhacks2026' }
  - { label: devpost, href: 'https://devpost.com/software/heard-37hzow' }
highlights:
  - Built the on-device lip-reading pipeline — ported Auto-AVSR to ONNX and quantized it to int8 (775 MB → 203 MB), running in the browser via onnxruntime-web with face tracking in a Web Worker
  - Built the FastAPI GPU inference service on RunPod (beam search + language model, top-3 readings) and the opt-in training-pair intake
images:
  - { src: '../../assets/projects/heard-landing.webp', alt: 'heard landing page — "Everyone deserves to be heard."' }
verified: true
source: repo analysis + confirmed by user 2026-10-06
---

An assistive silent-speech app: mouth your words at a webcam and heard reads your lips and speaks
for you, then turns everyone else's speech into live, speaker-labelled captions.
