import VariantButton from "@/components/ui/VariantButton"

export default function NavBar(){
    return (
        <div className="content-center flex flex-row justify-center py-2 font-medium text-xl text-text">
            <nav className="flex flex-row justify-center gap-4 w-full max-w-480 border-b border-border pb-2">
                <VariantButton href="#contacts" className="bg-transparent border-transparent" fillClass="bg-accent-500" variant="ghost">Contact</VariantButton>
                <VariantButton href="#workExperience" className="bg-transparent border-transparent" fillClass="bg-accent-500" variant="transparent">Work</VariantButton>
                <VariantButton href="#projectsSection" className="bg-transparent border-transparent" fillClass="bg-accent-500" variant="ghost">Projects</VariantButton>
                <VariantButton href="#aboutMeSection" className="bg-transparent border-transparent" fillClass="bg-accent-500" variant="ghost">About</VariantButton>
            </nav>
        </div>
    );
}