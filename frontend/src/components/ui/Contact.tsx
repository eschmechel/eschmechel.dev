import { useEffect } from 'react'
import { getCalApi } from "@calcom/embed-react"
import { H4, Body } from '@/components/Typographies'
import Icon from './Icon'
import VariantButton from './VariantButton'

interface ContactProps {
    isOpen: boolean
    onClose: () => void
}

export default function Contact({ isOpen, onClose }: ContactProps) {
    useEffect(() => {
        (async function () {
            const cal = await getCalApi()
            cal("ui", {
                theme: "dark",
                styles: { branding: { brandColor: "#3B82F6" } },
            })
        })()
    }, [])

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center animate-in fade-in duration-600" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50" />
            <div 
                className="relative backdrop-blur-xs bg-surface/25 border-2 border-accent-700 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-600"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-muted hover:text-text transition-colors"
                    aria-label="Close modal"
                >
                    <span className="text-2xl leading-none" aria-hidden="true">×</span>
                </button>

                <div className="flex flex-col">
                    <H4 className="text-2xl bg-linear-to-r from-accent-300 to-accent-700 bg-clip-text text-transparent mb-4">
                        Let's Connect
                    </H4>
                    <Body className="text-accent-50 mb-4">
                        Available for coffee chats, consulting, and opportunities.
                    </Body>
                    <div className="flex flex-col gap-2">
                        <VariantButton
                            href="/Elliott_Schmechel_Resume.pdf"
                            rel="noopener noreferrer"
                            className="py-2.5 bg-accent-500 w-full"
                            fillClass="bg-linear-to-r from-accent-500 to-accent-700"
                            textClass="text-white"
                            variant="solid"
                        >
                            <Icon name="file-download" className="w-4 h-4 inline-block align-sub mr-1" ariaLabel="File Download Icon" />
                            Resume
                        </VariantButton>
                        <VariantButton
                            href="mailto:elliottschmechel@gmail.com"
                            className="py-2.5 bg-accent-500 w-full"
                            fillClass="bg-linear-to-r from-accent-500 to-accent-700"
                            textClass="text-white"
                            variant="solid"
                        >
                            <Icon name="person-add" className="w-4 h-4 inline-block align-sub mr-1" ariaLabel="Person Add Icon" />
                            Contact
                        </VariantButton>
                        <VariantButton
                            type="button"
                            data-cal-link="eschmechel/coffee-chat"
                            className="py-2.5 bg-accent-500 w-full"
                            fillClass="bg-linear-to-r from-accent-500 to-accent-700"
                            textClass="text-white"
                            variant="solid"
                        >
                            <Icon name="buy-me-a-coffee-filled" className="w-5 h-5 inline-block align-sub mr-2" ariaLabel="Coffee Icon" />
                            Schedule Coffee Chat
                        </VariantButton>
                        <VariantButton
                            type="button"
                            data-cal-link="eschmechel/virtual-meeting"
                            className="py-2.5 bg-accent-500 w-full"
                            fillClass="bg-linear-to-r from-accent-500 to-accent-700"
                            textClass="text-white"
                            variant="solid"
                        >
                            <Icon name="computer" className="w-5 h-5 inline-block align-sub mr-2" ariaLabel="Computer Icon"/>
                            Schedule Virtual Meeting
                        </VariantButton>
                    </div>
                </div>
            </div>
        </div>
    )
}