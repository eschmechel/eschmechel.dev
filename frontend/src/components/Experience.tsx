import GithubChart from '@/components/ui/GithubChart'
import ExperiencePill from '@/components/ui/ExperiencePill'
import experiences from '@/data/experiences'

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