export interface Experience {
  type: "work" | "project" | "education";
  title?: string;
  subTitle?: string;
  iconLocation: string;
  startDate: Date;
  endDate?: Date | "Present";
  description?: string;
  githubUrl?: string;
  projectUrl?: string;
}

export const experiences: Experience[] = [
  {
    type: "work",
    title: "Volunteer",
    subTitle: "Web Summit Vancouver 2026",
    iconLocation: "/websummit-logo.png",
    startDate: new Date(2026, 4),
    description:
      "Supported event operations at Web Summit Vancouver 2026 across registration, data analytics, and attendee response and support.",
  },
  {
    type: "work",
    title: "Volunteer Fullstack Developer",
    subTitle: "United Nations Association of Canada - Vancouver",
    iconLocation: "/unac-v.webp",
    startDate: new Date(2025, 9),
    endDate: "Present",
    description:
      "Contributed to the UNAC-Vancouver website as a fullstack developer. Translated Figma designs into responsive React components, set up Cloudflare Pages CI/CD for automated deployments, and managed content updates.",
    projectUrl: "https://unacvancouver.org",
  },
  {
    type: "work",
    title: "Volunteer Software Developer",
    subTitle: "Langara French Club",
    iconLocation: "/langarafr.webp",
    startDate: new Date(2025, 6),
    endDate: new Date(2025, 11),
    description:
      "Developed and maintained the Langara French Club website using React and TypeScript. Managed IT infrastructure including email forwarding, mailing lists, and Microsoft 365 tools.",
  },
  {
    type: "work",
    title: "Game Tester",
    subTitle: "Riot Games",
    iconLocation: "/riotgames.webp",
    startDate: new Date(2024, 8),
    endDate: new Date(2025, 0),
    description:
      "Tested game features and updates to identify bugs and performance regressions before release. Collaborated with dev teams to triage and document issues in the bug tracking pipeline.",
    projectUrl: "https://www.riotgames.com/en/playtest",
  },
  {
    type: "project",
    title: "OpenCode Extension Stack",
    subTitle: "Multi-package orchestration system for AI agent workflows",
    iconLocation: "/opencode-logo.svg",
    startDate: new Date(2026, 3),
    description:
      "Built an extension stack for OpenCode that handles cron jobs, worker orchestration, persistent memory, prompt packs, and a remote bridge. The monorepo spans six packages (core, scheduler, orchestrator, memory, packs, bridge) with CLI tools, local state management, and Telegram integration for remote approval flows.",
    githubUrl: "https://github.com/eschmechel/opencode-extension-stack",
  },
  {
    type: "project",
    title: "Data For All",
    subTitle: "Hack the Coast 2026 - GPU Infrastructure & Training Pipeline",
    iconLocation: "/dataforall-logo.png",
    startDate: new Date(2026, 1),
    description: "For Hack the Coast 2026, I built the GPU training infrastructure for Data For All's collaborative ML platform. Automated Lambda Labs H100 provisioning via REST API and SSH with heartbeat monitoring and stale-instance cleanup across multiple regions. Containerized the training pipeline, deployed on Kubernetes with managed PostgreSQL and Alembic migrations, covering safety filters, S3 dataset loading, and SmolVLM fine-tuning with QLoRA. Optimized training throughput with Flash Attention 3, torch.compile, and TF32 precision.",
    githubUrl: "https://github.com/LMSAIH/htc2026",
    projectUrl: "https://dataforall.xyz",
  },
  {
    type: "project",
    title: "Learn-LM",
    subTitle: "SystemHacks2026 Winner - Best use of SFUCoursesAPI",
    iconLocation: "/learnlm-logo.png",
    startDate: new Date(2026, 1),
    description: `Contributed frontend and infrastructure improvements to LearnLM, an AI-powered study assistant that integrates with the SFU Courses API to generate study materials and practice questions. I enhanced the notes editor (markdown import/export, AI-block controls), stabilized voice/AI features (ElevenLabs integration, voice previews, Deepgram/TTS fixes), and implemented an MCP-based Cloudflare AI gateway with response caching for cost-effective model access. Added CI/CD pipelines and rate limiting to improve reliability under load.`,
    githubUrl: "https://github.com/LMSAIH/xhacks2026",
    projectUrl: "https://learn-lm.com",
  },
  {
    type: "project",
    title: "Beepd",
    subTitle: "JourneyHacks2026 Winner - Lone Wanderer",
    iconLocation: "/beepd-logo.svg",
    startDate: new Date(2026, 0),
    description:
      "Solo developed Beepd, during JourneyHacks2026 SFU Surge's 12hr Hackathon, an interactive web application seeking to replace Life 360 and Find My with a privacy-focused alternative. Implemented real-time location sharing with geofencing alerts utilizing leaflet.js and Cloudflare workers for serverless backend functionality.",
    githubUrl: "https://github.com/eschmechel/JourneyHacks2026",
    projectUrl: "https://beepd.tech",
  },
  {
    type: "project",
    title: "DNS Server",
    subTitle: "C++ DNS server with recursive resolution",
    iconLocation: "/blank.svg",
    startDate: new Date(2025, 10),
    description:
      "Wrote a DNS server in C++ that parses DNS packets, resolves records recursively, and handles A, AAAA, CNAME, MX, and NS types. Followed RFC 1035 and implemented the wire protocol from scratch.",
    githubUrl: "https://github.com/eschmechel/codecrafters-dns-server-cpp",
  },
  {
    type: "project",
    title: "Mapd",
    subTitle:
      "StormHacks 2025 Winner - Finalist, Best Design, 2nd Place UN SDG Enactus",
    iconLocation: "/mapd.svg",
    startDate: new Date(2025, 9),
    description:
      "Developed Mapd, an innovative web application that leverages AI to assist researchs and the general public on impact that building permits will have on local communities and the surronding ammenities in the city of Vancouver. I worked on the fullstack development, bouncing from frontend design of the homepage to helping co-create the backend architecture using FASTAPI and Cloudflare Workers.",
    projectUrl: "https://mapd.tech",
    githubUrl: "https://github.com/LMSAIH/StormHacks2025",
  },
  {
    type: "project",
    title: "Student Software Association",
    subTitle: "Founding Member & Developer",
    iconLocation: "/ssa.webp",
    startDate: new Date(2025, 6),
    endDate: "Present",
    description:
      "Co-founded the Student Software Association (SSA) aimed at fostering a community for aspiring software developers. Currently the SSA website is under development.",
    githubUrl: "https://github.com/student-software-association",
    projectUrl: "https://studentsoftware.org",
  },
  {
    type: "project",
    title: "Unofficial Langara Scheduler",
    subTitle: "Student Software Association",
    iconLocation: "/langara.png",
    startDate: new Date(2025, 6),
    endDate: new Date(2025, 9),
    description:
      "Developed a course scheduling web app for Langara College students. Led the scraping pipeline against BCTransferGuide and designed the transfer credit schema and query architecture using TypeScript.",
    githubUrl: "https://github.com/LMSAIH/LangaraScraper",
  },
  {
    type: "project",
    title: "Personal Homelab",
    subTitle: "Ongoing Project",
    iconLocation: "/homelab.svg",
    startDate: new Date(2025, 5),
    description:
      "Built and maintains a personal homelab running Proxmox, Docker, and Kubernetes for infrastructure experimentation. Developed an Obsidian MCP server in Go and a monitoring/notification stack for the homelab environment.",
  },
  {
    type: "education",
    title: "Associates of Science in Computer Science",
    subTitle: "Langara College",
    iconLocation: "/langara.png",
    startDate: new Date(2024, 8),
    endDate: "Present",
    projectUrl: "https://langara.ca",
    description:
      "Relevant Coursework: Data Structures and Algorithms, Intro to Logic, Unix Tools & Scripting, Discrete Mathematics, Object-Oriented Programming, Networking.",
  },
];

export default experiences;
