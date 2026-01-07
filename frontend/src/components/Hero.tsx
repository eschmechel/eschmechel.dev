import { Display, Muted } from '@/components/Typographies'
import Icon from '@/components/ui/Icon'
import VariantButton from '@/components/ui/VariantButton'

export default function Hero() {
    return (
        <div className="max-w-7xl flex flex-col justify-center mx-auto">
            <Display id="heroHeader" className="text-center mt-10 mb-4">
                Elliott Schmechel
            </Display>

            <div id="heroSubHeader" className="flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center">
                <div className="flex items-center gap-1.5">
                    <Icon name="briefcase" className="w-8 h-8 text-accent-50" ariaLabel="Briefcase" />
                    <Muted className="text-xl">
                        Software Engineer
                    </Muted>
                </div>
                <div className="flex items-center gap-0.5">
                    <Icon name="map-marker" className="w-8 h-8 text-accent-50" ariaLabel="Map Marker" />
                    <Muted className="text-xl">
                        Vancouver, BC
                    </Muted>
                </div>
            </div>

            <div id = "contacts" className="flex justify-center mt-10 gap-3">
                <VariantButton
                    className="bg-accent-500 py-2 px-4 font-medium text-lg"
                    variant="highlight"
                    fillClass="bg-accent-700"
                    textClass="text-white"
                    href="mailto:elliottschmechel@gmail.com">
                        Contact Me
                </VariantButton>
                <VariantButton
                    className="border-border py-2 px-8 font-medium text-lg"
                    fillClass="bg-surface"
                    variant="transparent"
                    textClass="text-text"
                    href="/Elliott_Schmechel_Resume.pdf"
                    // target="_blank"  currently dont know if this is useful until resume is uploaded
                    rel="noopener noreferrer">
                        Resume
                </VariantButton>
            </div>

            <div id="heroSocials" className="flex justify-center mt-6 gap-6">
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
        </div>
    );
}