import { useState, memo } from 'react'
import { H4, Label, Body, BodySmall } from '@/components/Typographies'
import Icon from '@/components/ui/Icon'
import VariantButton from '@/components/ui/VariantButton'


interface experienceProps{
    type: "work" | "project" | "education";
    role?: string;
    company?: string;
    iconLocation: string;
    startDate: Date;
    endDate?: Date | 'Present';
    description?: string;
    githubUrl?: string;
    projectUrl?: string;
}

const IconButtons = memo(function IconButtons({ githubUrl, projectUrl }: { githubUrl?: string; projectUrl?: string }) {
    if (!githubUrl && !projectUrl) return null

    return (
        <div className="absolute top-3 right-3 z-20 flex gap-2 items-center pointer-events-auto">
            {githubUrl && (
                <VariantButton
                    variant="ghost"
                    className="px-1 py-0.5 text-xs min-w-0 max-w-16 max-h-16 transition duration-150 ease-in-out hover:scale-105 bg-accent-600/90 border-transparent"
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Icon name="github" />
                </VariantButton>
            )}
            {projectUrl && (
                <VariantButton
                    variant="ghost"
                    className="px-1 py-0.5 text-xs min-w-0 max-w-16 max-h-16 transition duration-150 ease-in-out hover:scale-105 bg-accent-600/90 border-transparent"
                    href={projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Icon name="arrow-right" />
                </VariantButton>
            )}
        </div>
    )
})

export default function ExperiencePill(props: experienceProps){
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="relative">
            <div 
                className="w-full hover:transition-shadow bg-transparent rounded-xl px-3 py-1 text-accent-100 text-sm font-medium hover:shadow-lg hover:bg-accent-500/5 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex gap-3 items-center">
                    <img src={props.iconLocation} alt={`${props.company || 'Experience'} logo`} className="w-12 h-12 rounded-2xl object-contain shrink-0"/>
                    
                    <div className="flex-1">
                        {props.role && <H4 className="">{props.role}</H4>}

                        {props.company && <Label className="">{props.company}</Label>}

                        <BodySmall className="">
                            {props.endDate 
                                ? `${props.startDate.toLocaleString('default', { month: 'short', year: 'numeric' })} - ${props.endDate === 'Present' ? 'Present' : props.endDate.toLocaleString('default', { month: 'short', year: 'numeric' })}`
                                : props.startDate.toLocaleString('default', { month: 'short', year: 'numeric' })
                            }
                        </BodySmall>
                    </div>

                    <div className="w-14 shrink-0" />
                </div>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    {props.description && 
                        <Body className="ml-12 mt-1 border-t border-accent-500 pt-6">
                            {props.description}
                        </Body>
                    }
                </div>
            </div>

            <IconButtons githubUrl={props.githubUrl} projectUrl={props.projectUrl} />
        </div>
    );
}