// Phase 2–3 seed content so the carousel has real panels to move between.
// Phase 4 replaces this module with Astro content collections + `verified` flags.

export const PROFILE = {
  name: 'Elliott Schmechel',
  handle: 'eschmechel',
  headline: 'Systems-focused builder — GPU training infra, self-training agents, real-time edge apps.',
  facts: [
    { icon: '</>', text: 'Volunteer fullstack @ UNAC-Vancouver' },
    { icon: '◇', text: 'CS @ Langara · grad May 2027' },
    { icon: '⌖', text: 'Vancouver, BC' },
  ],
  socials: [
    { label: 'Email', href: 'mailto:elliottschmechel@gmail.com' },
    { label: 'GitHub', href: 'https://github.com/eschmechel' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/eschmechel' },
    { label: 'dev.to', href: 'https://dev.to/eschmechel' },
  ],
};

export const BANNER = String.raw`              __                 __       __
 ___ ___ ____/ /  __ _  ___ ____/ /  ___ / /
/ -_|_-</ __/ _ \/  ' \/ -_) __/ _ \/ -_) /
\__/___/\__/_//_/_/_/_/\__/\__/_//_/\__/_/  `;

export interface SeedProject {
  slug: string;
  name: string;
  status: { text: string; tone: 'win' | 'accent' | 'warn' | 'muted' }[];
  summary: string;
  tech: string[];
  links: { label: string; href: string }[];
}

export const FEATURED: SeedProject[] = [
  {
    slug: 'heard',
    name: 'heard',
    status: [{ text: 'Hackathon · StormHacks 2026', tone: 'accent' }],
    summary:
      'Lip-reads silently mouthed words in the browser and speaks them aloud, then turns everyone else’s speech into live, speaker-labelled captions. I built the on-device lip-reading pipeline and the GPU inference service.',
    tech: ['TypeScript', 'React', 'Python', 'FastAPI', 'PyTorch', 'ONNX Runtime Web', 'MediaPipe', 'ElevenLabs', 'RunPod'],
    links: [
      { label: 'site', href: 'https://tryheard.tech' },
      { label: 'repo', href: 'https://github.com/LMSAIH/stormhacks2026' },
    ],
  },
  {
    slug: 'hermes-apprentice',
    name: 'hermes-apprentice',
    status: [
      { text: 'Winner · Hermes Agent Challenge', tone: 'win' },
      { text: 'Open Source', tone: 'muted' },
    ],
    summary:
      'A second learning loop for Hermes Agent: spots repeated conversation patterns, fine-tunes small QLoRA specialists on them, gates each one on a held-out set, and routes matching requests to a free local endpoint.',
    tech: ['Go', 'Python', 'Unsloth', 'vLLM', 'ONNX', 'Prometheus', 'Grafana'],
    links: [
      { label: 'repo', href: 'https://github.com/eschmechel/hermes-apprentice' },
      { label: 'writeup', href: 'https://dev.to/eschmechel/skills-are-prompts-heres-how-hermes-apprentice-turns-them-into-weights-59eh' },
    ],
  },
  {
    slug: 'learnlm',
    name: 'learnlm',
    status: [
      { text: 'Best Use of SFU Courses API · XHacks 2026', tone: 'win' },
      { text: 'Continuing as TutorNexus', tone: 'muted' },
    ],
    summary:
      'Serverless tutoring backend on Cloudflare Workers: RAG over 998 SFU courses, a 21-tool MCP server, and real-time voice tutoring over Durable Objects.',
    tech: ['TypeScript', 'Hono', 'Cloudflare Workers', 'D1', 'Vectorize', 'Durable Objects', 'Deepgram'],
    links: [],
  },
  {
    slug: 'dataforall',
    name: 'dataforall',
    status: [{ text: 'Hackathon · HTC 2026', tone: 'accent' }],
    summary:
      'Infrastructure lead for a distributed GPU training platform: H100 provisioning via the Lambda Labs API, Kubernetes manifests for a 4-replica backend, and GPU worker lifecycle management.',
    tech: ['Python', 'FastAPI', 'Kubernetes', 'Docker', 'Lambda Labs', 'PostgreSQL'],
    links: [],
  },
  {
    slug: 'beepd',
    name: 'beepd',
    status: [{ text: 'Lone Wanderer · JourneyHacks 2026', tone: 'win' }],
    summary:
      'Real-time proximity radar built solo in 12 hours: indexed geospatial queries on D1, friend flows, and a Leaflet map with clustering.',
    tech: ['TypeScript', 'Hono', 'Drizzle', 'D1', 'Leaflet'],
    links: [],
  },
  {
    slug: 'homelab',
    name: 'homelab',
    status: [{ text: 'Ongoing', tone: 'warn' }],
    summary: 'Multi-VM Proxmox lab with VLAN isolation running self-hosted services. Live status lives in ~/.',
    tech: ['Proxmox', 'Docker', 'Linux', 'Prometheus'],
    links: [{ label: '~/', href: '/~' }],
  },
];

export const ARCHIVED = [
  { name: 'mapd', note: 'StormHacks 2025 · building-permit impact explorer', href: 'https://github.com/LMSAIH/StormHacks2025' },
  { name: 'langara-scheduler', note: 'course scheduler + transfer-credit scraper', href: 'https://github.com/LMSAIH/LangaraScraper' },
];

export const EXPERIENCE = [
  {
    role: 'Technical Content Engineer',
    org: 'LicenseSpring',
    when: 'Jun 2026 – Aug 2026',
    where: 'Vancouver, BC',
    bullets: [
      'Built reference sample applications and integration guides across the C++, Go, Python, .NET and Node.js SDKs for developer onboarding',
      'Developed a demo sandbox environment and documentation for the licensing API',
      'Scripted video content for the LicenseSpring University developer education platform',
    ],
  },
  {
    role: 'Volunteer Fullstack Developer',
    org: 'United Nations Association of Canada — Vancouver',
    when: 'Oct 2025 – Present',
    where: 'Hybrid',
    bullets: [
      'Translate Figma designs into responsive React components for the website rewrite',
      'Set up Cloudflare Pages CI/CD for automated deployments',
    ],
  },
  {
    role: 'Volunteer',
    org: 'Web Summit Vancouver 2026',
    when: 'May 2026',
    where: 'Vancouver, BC',
    bullets: ['Supported event operations across registration, analytics and attendee support'],
  },
  {
    role: 'Founding Member & Developer',
    org: 'Student Software Association',
    when: 'Jul 2025',
    where: 'Langara College',
    bullets: ['Co-founded a community for student developers'],
  },
  {
    role: 'Game Tester',
    org: 'Riot Games',
    when: 'Sep 2024 – Jan 2025',
    where: 'Remote',
    bullets: ['Tested features and updates to surface bugs and performance regressions before release'],
  },
];

export const SKILLS = [
  { group: 'languages', items: ['Go', 'C++', 'Python', 'TypeScript', 'SQL', 'Bash'] },
  { group: 'backend', items: ['Hono', 'FastAPI', 'Next.js', 'Drizzle', 'PostgreSQL'] },
  { group: 'infra', items: ['Docker', 'Kubernetes', 'Proxmox', 'Firecracker', 'Cloudflare Workers / Pages / D1', 'GitHub Actions'] },
  { group: 'ml / ai', items: ['LoRA fine-tuning (Unsloth)', 'local LLMs', 'MCP servers', 'RAG (Vectorize)', 'Deepgram'] },
];

export const NOW = [
  { label: 'building', text: 'this site (v3)' },
  { label: 'studying', text: 'CS @ Langara, final year' },
];
