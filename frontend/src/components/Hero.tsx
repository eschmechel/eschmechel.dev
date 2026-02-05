import { Display, BodyLarge, Muted } from '@/components/Typographies'
import Icon from '@/components/ui/Icon'
import VariantButton from '@/components/ui/VariantButton'

export default function Hero() {
    const handleResumeClick = (e: React.MouseEvent) => {
        e.preventDefault()
        const link = document.createElement('a')
        link.href = '/Elliott_Schmechel_Resume.pdf'
        link.download = 'Elliott_Schmechel_Resume.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        setTimeout(() => window.location.hash = '', 100)
    }

    return (
        <div className="max-w-7xl flex flex-col justify-center mx-auto">
            <Display id="heroHeader" className="text-center mt-10 mb-4">
                Elliott Schmechel
            </Display>

            <div id="heroSubHeader" className="flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center">
                <div className="flex items-center gap-1.5">
                    <Icon name="briefcase" className="w-6 h-6 text-accent-50" ariaLabel="Briefcase" />
                    <Muted className="text-xl">
                        Software Engineer
                    </Muted>
                </div>
                <div className="flex items-center gap-0.5">
                    <Icon name="map-marker" className="w-6 h-6 text-accent-50" ariaLabel="Map Marker" />
                    <Muted className="text-xl">
                        Vancouver, BC
                    </Muted>
                </div>
            </div>

            <div id = "contacts" className="flex justify-center mt-10 gap-3">
                <VariantButton
                    className="border-border py-3 px-12 font-medium text-xl"
                    fillClass="bg-surface"
                    variant="transparent"
                    textClass="text-text"
                    href="/Elliott_Schmechel_Resume.pdf"
                    onClick={handleResumeClick}
                    rel="noopener noreferrer">
                        Resume
                </VariantButton>
            </div>

            <div id="heroSocials" className="flex justify-center mt-10 gap-6">
                <a href="https://www.github.com/eschmechel" target="_blank" rel="noopener noreferrer">
                    <Icon name="github" className="w-12 h-12 pt-1 text-accent-50" ariaLabel="GitHub icon" />
                </a>
                <a href="https://www.linkedin.com/in/elliott-schmechel/" target="_blank" rel="noopener noreferrer">
                    <Icon name="linkedin" className="w-12 h-12 pt-1 text-accent-50" ariaLabel="LinkedIn icon" />    
                </a>
                <a href="https://twitter.com/eschmechel" target="_blank" rel="noopener noreferrer">
                    <Icon name="twitter-x" className="w-12 h-12 pt-1 text-accent-50" ariaLabel="Twitter X icon" />
                </a>
                <a href="https://blueskyweb.xyz/eschmechel" target="_blank" rel="noopener noreferrer">
                    <Icon name="bluesky" className="w-12 h-12 pt-1 text-accent-50" ariaLabel="Bluesky icon" />
                </a>
            </div>

            <div id="heroDescription" className="flex justify-center mt-24 px-4 text-center">
                <BodyLarge className="items-center max-w-5xl ">
                    I am software engineer with a focus on producing cohesive, accessible, and performant solutions. 
                    I enjoy a variety of fields, from full-stack web applications, to reverse enigineering, up-to cloud infra and AI.
                </BodyLarge>
            </div>
        </div>
    );
}