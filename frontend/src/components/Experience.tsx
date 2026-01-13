import GithubChart from "@/components/ui/GithubChart";
import ExperiencePill from "@/components/ui/ExperiencePill";


interface Experience{
    type: "work" | "project" | "education";
    title?: string;
    subTitle?: string;
    iconLocation: string;
    startDate: Date;
    endDate?: Date | 'Present';
    description?: string;
    githubUrl?: string;
    projectUrl?: string;
}

const experiences: Experience[] = [
    {
        type: "work",
        title: "Volunteer Fullstack Developer",
        subTitle: "United Nations Association of Canada - Vancouver",
        iconLocation: "/unac-v.jpg",
        startDate: new Date(2025, 9),
        endDate: "Present",
        description: "I contribute to the development and maintenance of the UNAC-Vancouver website, translating figma designs into modern react components as well as leveraging cloudflare for CI/CD integration and hosting.",
        projectUrl: "https://unac-vancouver.ca"
    },
    {
        type: "work",
        title: "Volunteer Software Developer",
        subTitle: "Langara French Club",
        iconLocation: "/langara-french-club.png",
        startDate: new Date(2025,6),
        endDate: new Date(2025,11),
        description: "Developed and maintained the Langara French Club website using React and TypeScript, implementing features such as event management, user authentication, and responsive design to enhance user experience.",
        projectUrl: "https://langarafrenchclub.com"
    
    },
    {
        type: "work",
        title: "Game Tester",
        subTitle: "Riot Games",
        iconLocation: "/riot-games.png",
        startDate: new Date(2024,8),
        endDate: new Date(2025,0),
        description: "Conducted comprehensive testing of game features and updates to identify bugs and ensure optimal performance. Collaborated with development teams to provide feedback and improve game quality."
    },
    {
        type: "project",
        title: "Mapd",
        subTitle: "StormHacks 2025 Winner",
        iconLocation: "/mapd-logo.png",
        startDate: new Date(2025,9),
        description: "Led the development of Mapd, an innovative web application that utilizes AI to generate personalized travel itineraries based on user preferences. Integrated mapping APIs to visualize routes and points of interest, enhancing user engagement and experience.",
        githubUrl: "https://github.com/eschmechel/mapd",
        projectUrl: "https://devpost.com/software/mapd"
    },
    {
        type: "project",
        title: "Student Software Association",
        subTitle: "Founding Member & Developer",
        iconLocation: "/ssa-logo.png",
        startDate: new Date(2025,6),
        endDate: "Present",
        description: "Co-founded the Student Software Association (SSA) aimed at fostering a community for aspiring software developers. Developed the SSA website and managed online presence to engage members and promote events.",
        githubUrl: "https://github.com/student-software-association",
        projectUrl: "https://studentsoftware.org"
    },
    {
        type: "project",
        title: "Langara Scheduler",
        subTitle: "Student Software Association",
        iconLocation: "/langara-scheduler.png",
        startDate: new Date(2025,6),
        endDate: new Date(2025,9),
        description: "Developed Langara Scheduler, a web application designed to help Langara College students efficiently plan their academic schedules. Implemented features such as course selection, timetable visualization, and conflict detection using React and TypeScript.",
        githubUrl: "https://github.com/student-software-association/langara-scheduler",
        projectUrl: "https://langarascheduler.ca"
    },
    {
        type: "project",
        title: "Personal Homelab",
        subTitle: "Ongoing Project",
        iconLocation: "/homelab.png",
        startDate: new Date(2023,0),
        description: "Designed and implemented a personal homelab environment to explore and experiment with various technologies including virtualization, containerization, and network management. Utilized tools such as Proxmox, Docker, and Kubernetes to create a versatile and scalable infrastructure for learning and development."
    },
    {
        type: "education",
        title: "Associates of Science in Computer Science",
        subTitle: "Langara College",
        iconLocation: "/langara-college.png",
        startDate: new Date(2024,10),
        endDate: "Present",
        description: "Relevant Coursework: Data Structures and Algorithms, Web Development, Database Management, Software Engineering Principles, Object-Oriented Programming, Computer Systems and Architecture."
    }
]

export default function Experience(){
    return (
        <div id="experience" className="max-w-7xl mx-auto px-4 py-16">
            {/* Work Experience Section */}
            <h2 id="work" className="text-4xl font-bold text-left mt-4 mb-8">Work Experience</h2>
            <div id="workExperiences" className="border-t border-accent-500 pt-6">
                {
                    experiences.filter(exp => exp.type === "work").map((exp, index) => (
                        <div key={index} className="mb-6">
                            <ExperiencePill
                                type={exp.type}
                                role={exp.title}
                                company={exp.subTitle}
                                iconLocation={exp.iconLocation}
                                startDate={exp.startDate}
                                endDate={exp.endDate}
                                description={exp.description}
                                githubUrl={exp.githubUrl}
                                projectUrl={exp.projectUrl}
                            />
                        </div>
                    ))
                }
            </div>
            <h2 id="projectSection" className="text-4xl font-bold text-left mt-16 mb-8">Projects</h2>
            <div id="projectExperiences" className="border-t border-accent-500 pt-6">
                {
                    experiences.filter(exp => exp.type === "project").map((exp, index) => (
                        <div key={index} className="mb-6">
                            <ExperiencePill
                                type={exp.type}
                                role={exp.title}
                                company={exp.subTitle}
                                iconLocation={exp.iconLocation}
                                startDate={exp.startDate}
                                endDate={exp.endDate}
                                description={exp.description}
                                githubUrl={exp.githubUrl}
                                projectUrl={exp.projectUrl}
                            />
                        </div>
                    ))
                }
            </div>
            {/* Github Contribution Chart */}   
            <GithubChart aria-label="Github contributing chart"/>

            <h2 id="educationSection" className="text-4xl font-bold text-left mt-16 mb-8">Education</h2>
            <div id="educationExperiences" className="border-t border-accent-500 pt-6">
                {
                    experiences.filter(exp => exp.type === "education").map((exp, index) => (
                        <div key={index} className="mb-6">
                            <ExperiencePill
                                type={exp.type}
                                role={exp.title}
                                company={exp.subTitle}
                                iconLocation={exp.iconLocation}
                                startDate={exp.startDate}
                                endDate={exp.endDate}
                                description={exp.description}
                                githubUrl={exp.githubUrl}
                                projectUrl={exp.projectUrl}
                            />
                        </div>
                    ))
                }
            </div>

            
        </div>
    );
}