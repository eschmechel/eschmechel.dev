import { useEffect } from 'react';
import { getCalApi } from "@calcom/embed-react";
import HashLink from "@/components/ui/HashLink";
import { Link, H4, Body } from '@/components/Typographies';
import Icon from './ui/Icon';
import VariantButton from './ui/VariantButton';

export default function Footer(){
    useEffect(() => {
        (async function () {
            const cal = await getCalApi();
            cal("ui", {
                theme: "dark",
                styles: { branding: { brandColor: "#3B82F6" } },
            });
        })();
    }, []);

    return (
        <footer className="max-w-7xl mx-auto border-t-2 border-accent-700 pt-6 pb-4">
            <div id="footerUpperSection" className="flex flex-row mx-8 max-sm:gap-4 justify-evenly">
                <div id ="footerContactMe" className="flex flex-col mr-auto max-w-65">
                    <H4 className="text-lg text-text mb-4">
                        Let's Connect
                    </H4>
                    <Body className="text-accent-50 mb-4">
                        Available for coffee chats, consulting, and opportunities.
                    </Body>
                    <div id="footerCalendarButtons" className="flex flex-col gap-1.5">

                        <VariantButton
                            type="button"
                            data-cal-link="eschmechel/coffee-chat"
                            className="py-2 bg-accent-500"
                            fillClass="bg-linear-to-r from-accent-500 to-accent-700"
                            textClass="text-white"
                            variant="solid"
                        >
                            <Icon name="buy-me-a-coffee-filled" className="w-5 h-5 inline-block align-sub mr-1" ariaLabel="Coffee Icon" />
                            Schedule Coffee Chat
                        </VariantButton>
                        <VariantButton
                            type="button"
                            data-cal-link="eschmechel/virtual-meeting"
                            className="py-2 bg-accent-500"
                            fillClass="bg-linear-to-r from-accent-500 to-accent-700"
                            textClass="text-white"
                            variant="solid"
                        >
                            <Icon name="computer" className="w-5 h-5 inline-block align-sub mr-1" ariaLabel="Computer Icon"/>
                            Schedule Virtual Meeting
                        </VariantButton>
                        <div className="flex flex-row gap-1.5">
                            <VariantButton
                                href="mailto:elliottschmechel@gmail.com"
                                className="flex-1 py-1.5 bg-accent-500 text-sm"
                                fillClass="bg-linear-to-r from-accent-500 to-accent-700"
                                textClass="text-white"
                                variant="solid"
                            >
                                <Icon name="person-add" className="w-4 h-4 inline-block align-sub mr-1" ariaLabel="Person Add Icon" />
                                Contact
                            </VariantButton>
                            <VariantButton
                                href="/Elliott_Schmechel_Resume.pdf"
                                rel="noopener noreferrer"
                                className="flex-1 py-1.5 bg-accent-500 text-sm"
                                fillClass="bg-linear-to-r from-accent-500 to-accent-700"
                                textClass="text-white"
                                variant="solid"
                            >
                                <Icon name="file-download" className="w-4 h-4 inline-block align-sub mr-1" ariaLabel="File Download Icon" />
                                Resume
                            </VariantButton>
                        </div>
                    </div>
                </div>

                <nav id="footerNavLinks" className="flex flex-col gap-6 ml-auto text-xl max-w-65 items-end">
                    <H4 className="text-xl text-text" aria-label="Footer Navigation Section">Navigation</H4>
                    <HashLink to="#contacts" className="" aria-label="Contact Link">
                        <Link>Contacts</Link>
                    </HashLink>
                    <HashLink to="#workExperience" className="" aria-label="Work Experience Link">
                        <Link>
                            <span className="max-sm:hidden">Work Experience</span>
                            <span className="sm:hidden">Work</span>
                        </Link>
                    </HashLink>
                    <HashLink to="#projectsSection" className="" aria-label="Projects Link">
                        <Link>Projects</Link>
                    </HashLink>
                    <HashLink to="#aboutMeSection" className="" aria-label="About Me Link">
                        <Link>
                            <span className="max-sm:hidden">About Me</span>
                            <span className="sm:hidden">About</span>
                        </Link>
                    </HashLink>
                    <HashLink to="#" className="" aria-label="Top of Page Link">
                        <Link>
                        <Icon name="arrow-up" className="w-4 h-4 inline-block mr-1" ariaLabel="Arrow Up Icon" />
                            Top
                        </Link>
                    </HashLink>
                </nav>
            </div>
            
            <div id="footerLowerSection" className="flex justify-center mt-4">
                <p className="text-sm text-text-muted">Elliott Schmechel © 2026</p>
            </div>
        </footer>
    );
}