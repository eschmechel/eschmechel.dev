import { useEffect, useState } from 'react'
import VariantButton from "@/components/ui/VariantButton"

export default function NavBar(){
    const [isVisible, setIsVisible] = useState(true)
    const [isAtTop, setIsAtTop] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const [scrollTimeout, setScrollTimeout] = useState<number | null>(null)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY

            // Check if at top
            setIsAtTop(currentScrollY < 10)

            // Clear existing timeout
            if (scrollTimeout) {
                clearTimeout(scrollTimeout)
            }

            // Show navbar immediately when scrolling up
            if (currentScrollY < lastScrollY) {
                setIsVisible(true)
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down - hide after 1.5 seconds
                const timeout = setTimeout(() => {
                    setIsVisible(false)
                }, 1500)
                setScrollTimeout(timeout)
            }

            setLastScrollY(currentScrollY)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (scrollTimeout) clearTimeout(scrollTimeout)
        }
    }, [lastScrollY, scrollTimeout])

    return (
        <div id="navBar" className={`max-w-7xl mx-auto sticky top-0 z-50 transition-transform duration-700 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className={`backdrop-blur-md bg-bg/80 content-center flex flex-row justify-center py-2 font-medium text-xl text-text ${isAtTop ? '' : 'border-b border-border'}`}>
                <nav className={`flex flex-row justify-center gap-4 w-full max-w-480`}>
                    <VariantButton href="#contacts" className="bg-transparent border-transparent" fillClass="bg-accent-500" variant="ghost">Contact</VariantButton>
                    <VariantButton href="#workExperience" className="bg-transparent border-transparent" fillClass="bg-accent-500" variant="transparent">Work</VariantButton>
                    <VariantButton href="#projectsSection" className="bg-transparent border-transparent" fillClass="bg-accent-500" variant="ghost">Projects</VariantButton>
                    <VariantButton href="#aboutMeSection" className="bg-transparent border-transparent" fillClass="bg-accent-500" variant="ghost">About</VariantButton>
                </nav>
            </div>
        </div>
    );
}