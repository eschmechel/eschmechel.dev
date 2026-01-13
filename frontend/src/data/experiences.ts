export interface Experience {
  type: 'work' | 'project' | 'education'
  title?: string
  subTitle?: string
  iconLocation: string
  startDate: Date
  endDate?: Date | 'Present'
  description?: string
  githubUrl?: string
  projectUrl?: string
}

export const experiences: Experience[] = [
  {
    type: 'work',
    title: 'Volunteer Fullstack Developer',
    subTitle: 'United Nations Association of Canada - Vancouver',
    iconLocation: '/unac-v.webp',
    startDate: new Date(2025, 9),
    endDate: 'Present',
    description:
      'I contribute to the development and maintenance of the new UNAC-Vancouver website, translating figma designs into modern react components as well as leveraging cloudflare pages for CI/CD integration and hosting.',
    projectUrl: 'https://unacvancouver.org',
  },
  {
    type: 'work',
    title: 'Volunteer Software Developer',
    subTitle: 'Langara French Club',
    iconLocation: '/langarafr.webp',
    startDate: new Date(2025, 6),
    endDate: new Date(2025, 11),
    description:
      'Developed and maintained the Langara French Club website using React and TypeScript to update content. Configured and managed IT systems, including email forwarding, mailing lists, and shared Office 365 tools.',
    projectUrl: 'https://langarafr.com',
  },
  {
    type: 'work',
    title: 'Game Tester',
    subTitle: 'Riot Games',
    iconLocation: '/riotgames.webp',
    startDate: new Date(2024, 8),
    endDate: new Date(2025, 0),
    description:
      'Conducted comprehensive testing of game features and updates to identify bugs and ensure optimal performance. Collaborated with development teams to provide feedback and improve game quality.',
    projectUrl: 'https://www.riotgames.com/en/playtest',
 },
  {
    type: 'project',
    title: 'Beepd',
    subTitle: 'JourneyHacks2026 Winner - Lone Wanderer',
    iconLocation: '/beepd-logo.svg',
    startDate: new Date(2026, 0),
    description:
      'Solo developed Beepd, during JourneyHacks2026 SFU Surge\'s 12hr Hackathon, an interactive web application seeking to replace Life 360 and Find My with a privacy-focused alternative. Implemented real-time location sharing with geofencing alerts utilizing leaflet.js and Cloudflare workers for serverless backend functionality.',
    githubUrl: 'https://github.com/eschmechel/JourneyHacks2026',
    projectUrl: 'https://beepd.tech',
  },
  {
    type: 'project',
    title: 'Mapd',
    subTitle: 'StormHacks 2025 Winner - Finalist, Best Design, 2nd Place UN SDG Enactus',
    iconLocation: '/mapd.svg',
    startDate: new Date(2025, 9),
    description:
      'Developed Mapd, an innovative web application that leverages AI to assist researchs and the general public on impact that building permits will have on local communities and the surronding ammenities in the city of Vancouver. I worked on the fullstack development, bouncing from frontend design of the homepage to helping co-create the backend architecture using FASTAPI and Cloudflare Workers.',
    projectUrl: 'https://mapd.tech',
  },
  {
    type: 'project',
    title: 'Student Software Association',
    subTitle: 'Founding Member & Developer',
    iconLocation: '/ssa.webp',
    startDate: new Date(2025, 6),
    endDate: 'Present',
    description:
      'Co-founded the Student Software Association (SSA) aimed at fostering a community for aspiring software developers. Currently the SSA website is under development.',
    githubUrl: 'https://github.com/student-software-association',
    projectUrl: 'https://studentsoftware.org',
  },
  {
    type: 'project',
    title: 'Unofficial Langara Scheduler',
    subTitle: 'Student Software Association',
    iconLocation: '/langara.png',
    startDate: new Date(2025, 6),
    endDate: new Date(2025, 9),
    description:
      'Developed Langara Scheduler, a web application designed to help Langara College students efficiently plan their academic schedules. I was the primary lead for scraping BCTransferGuide and implementing schema and transfer architecture to support queries utilizing TypeScript.',
    githubUrl: 'https://github.com/LMSAIH/LangaraScraper',
  },
  {
    type: 'project',
    title: 'Personal Homelab',
    subTitle: 'Ongoing Project',
    iconLocation: '/homelab.svg',
    startDate: new Date(2025, 5),
    description:
      'Designed and implemented a personal homelab environment to explore and experiment with various technologies including virtualization, containerization, load-balancing, and network management. Utilized tools such as Proxmox, Docker, and Kubernetes to create a versatile and scalable infrastructure for learning and development.',
  },
  {
    type: 'education',
    title: 'Associates of Science in Computer Science',
    subTitle: 'Langara College',
    iconLocation: '/langara.png',
    startDate: new Date(2024, 8),
    endDate: new Date(2026,7),
    projectUrl: 'https://langara.ca',
    description:
      'Relevant Coursework: Data Structures and Algorithms, Intro to Logic, Unix Tools & Scripting, Discrete Mathematics, Object-Oriented Programming, Networking.',
  },
]

export default experiences
