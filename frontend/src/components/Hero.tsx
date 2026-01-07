import { Display, Muted } from '@/components/Typographies'
import Icon from '@/components/ui/Icon'

export default function Hero() {
    return (
        <div>
            <Display className="text-center mt-8 mb-4">
                Elliott Schmechel
            </Display>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
                <div className="flex items-center gap-0.5">
                    <Icon name="briefcase" className="w-8 h-8 pt-1 text-accent-50" ariaLabel="Briefcase" />
                    <Muted className="text-xl">
                        Software Engineer
                    </Muted>
                </div>
                <div className="flex items-center gap-0.5">
                    <Icon name="map-marker" className="w-8 h-8 pt-1 text-accent-50" ariaLabel="Map Marker" />
                    <Muted className="text-xl">
                        Vancouver, BC
                    </Muted>
                </div>
                
            </div>
            
        </div>
    );
}