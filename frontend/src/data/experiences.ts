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
    iconLocation: '/unac-v.jpg',
    startDate: new Date(2025, 9),
    endDate: 'Present',
    description:
      'I contribute to the development and maintenance of the UNAC-Vancouver website, translating figma designs into modern react components as well as leveraging cloudflare for CI/CD integration and hosting.',
    projectUrl: 'https://unac-vancouver.ca',
  },
  {
    type: 'work',
    title: 'Volunteer Software Developer',
    subTitle: 'Langara French Club',
    iconLocation: '/langara-french-club.png',
    startDate: new Date(2025, 6),
    endDate: new Date(2025, 11),
    description:
      'Developed and maintained the Langara French Club website using React and TypeScript, implementing features such as event management, user authentication, and responsive design to enhance user experience.',
    projectUrl: 'https://langarafrenchclub.com',
  },
  {
    type: 'work',
    title: 'Game Tester',
    subTitle: 'Riot Games',
    iconLocation: '/riot-games.png',
    startDate: new Date(2024, 8),
    endDate: new Date(2025, 0),
    description:
      'Conducted comprehensive testing of game features and updates to identify bugs and ensure optimal performance. Collaborated with development teams to provide feedback and improve game quality.',
  },
  {
    type: 'project',
    title: 'Beepd',
    subTitle: 'JourneyHacks2026 Winner - Lone Wanderer',
    iconLocation: '/beepd-logo.png',
    startDate: new Date(2026, 0),
    description:
      'Led the development of Beepd, an innovative mobile application that connects individuals with local service providers for on-demand assistance. Implemented features such as real-time chat, geolocation services, and secure payment processing to enhance user experience and convenience.',
    githubUrl: 'https://github.com/eschmechel/JourneyHacks2026',
    projectUrl: 'https://devpost.com/software/beepd',
  },
  {
    type: 'project',
    title: 'Mapd',
    subTitle: 'StormHacks 2025 Winner - Finalist, Best Design, 2nd Place UN SDG Enactus',
    iconLocation: '/mapd-logo.png',
    startDate: new Date(2025, 9),
    description:
      'Led the development of Mapd, an innovative web application that utilizes AI to generate personalized travel itineraries based on user preferences. Integrated mapping APIs to visualize routes and points of interest, enhancing user engagement and experience.',
    githubUrl: 'https://github.com/LMSAIH/StormHacks2025',
    projectUrl: 'https://devpost.com/software/mapd',
  },
  {
    type: 'project',
    title: 'Student Software Association',
    subTitle: 'Founding Member & Developer',
    iconLocation: '/ssa-logo.png',
    startDate: new Date(2025, 6),
    endDate: 'Present',
    description:
      'Co-founded the Student Software Association (SSA) aimed at fostering a community for aspiring software developers. Developed the SSA website and managed online presence to engage members and promote events.',
    githubUrl: 'https://github.com/student-software-association',
    projectUrl: 'https://studentsoftware.org',
  },
  {
    type: 'project',
    title: 'Langara Scheduler',
    subTitle: 'Student Software Association',
    iconLocation: '/langara-scheduler.png',
    startDate: new Date(2025, 6),
    endDate: new Date(2025, 9),
    description:
      'Developed Langara Scheduler, a web application designed to help Langara College students efficiently plan their academic schedules. Implemented features such as course selection, timetable visualization, and conflict detection using React and TypeScript.',
    githubUrl: 'https://github.com/student-software-association/langara-scheduler',
    projectUrl: 'https://langarascheduler.ca',
  },
  {
    type: 'project',
    title: 'Personal Homelab',
    subTitle: 'Ongoing Project',
    iconLocation: '/homelab.png',
    startDate: new Date(2023, 0),
    description:
      'Designed and implemented a personal homelab environment to explore and experiment with various technologies including virtualization, containerization, and network management. Utilized tools such as Proxmox, Docker, and Kubernetes to create a versatile and scalable infrastructure for learning and development.',
  },
  {
    type: 'education',
    title: 'Associates of Science in Computer Science',
    subTitle: 'Langara College',
    iconLocation: '/langara-college.png',
    startDate: new Date(2024, 10),
    endDate: 'Present',
    description:
      'Relevant Coursework: Data Structures and Algorithms, Web Development, Database Management, Software Engineering Principles, Object-Oriented Programming, Computer Systems and Architecture.',
  },
]

export default experiences
