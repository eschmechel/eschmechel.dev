import * as React from 'react'
import { useEffect, useState} from 'react'
import { cn } from '@/lib/utils'
import { isSafariAgent } from '@/utils/browser'


// Eagerly load all icon SVGs at build time
const animatedIcons = import.meta.glob('@/assets/icons/*-animated.svg', { 
  eager: true, 
  query: '?raw',
  import: 'default' 
}) as Record<string, string>

const staticIcons = import.meta.glob('@/assets/icons/*-static.svg', { 
  eager: true, 
  query: '?raw',
  import: 'default' 
}) as Record<string, string>

type LineIconName = 'briefcase' | 'map-marker' | 'arrow-right' | 'arrow-left' | 'arrow-up' | 'arrow-down' | 'github' | 'linkedin' | 'twitter-x' | 'bluesky' | 'buy-me-a-coffee-filled' | 'computer' | 'file-download' | 'person-add' // add more as needed

interface IconProps {
  // Option 1: Use line-md icon by name
  name?: LineIconName
  // Option 2: Use custom children/fallback
  children?: React.ReactNode // preferred advanced SVG node
  fallback?: React.ReactNode | string // ReactNode or image src
  className?: string
  ariaLabel?: string
}

interface RenderLineIconProps {
  name: string
  isSafari: boolean
  isVisible: boolean
  className?: string
  ariaLabel?: string
}

function renderLineIcon({ name, isSafari, isVisible, className, ariaLabel }: RenderLineIconProps) {
  const iconPath = isSafari 
    ? `/src/assets/icons/${name}-static.svg`
    : `/src/assets/icons/${name}-animated.svg`
  
  const svgContent = isSafari ? staticIcons[iconPath] : animatedIcons[iconPath]

  if (!svgContent) {
    console.error(`Icon not found: ${iconPath}`)
    return null
  }

  // Ensure the inlined SVG scales to the parent's width/height by removing
  // hardcoded width/height attributes and forcing 100% sizing on the <svg>.
  let processed = svgContent.replace(/\s*(?:width|height)=(["']).*?\1/gi, '')
  processed = processed.replace(/<svg([^>]*)>/i, (_m, attrs) => {
    // preserve existing attributes, then add responsive sizing and block display
    // Add animation-play-state based on visibility
    const animationStyle = isVisible ? '' : ';animation-play-state:paused'
    return `<svg${attrs} width="100%" height="100%" style="display:block;width:100%;height:100%${animationStyle}" preserveAspectRatio="xMidYMid meet">`
  })

  return (
    <span 
      className={cn('inline-block', className)} 
      aria-label={ariaLabel}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  )
}

function renderCustomIcon(
  props: Omit<IconProps, 'name'>,
  isSafari: boolean
) {
  const { children, fallback, className, ariaLabel } = props

  if (isSafari && fallback) {
    return typeof fallback === 'string' 
      ? <img src={fallback} alt={ariaLabel ?? ''} className={className}/>
      : <span className={className} aria-label={ariaLabel}>{fallback}</span>
  }

  if (children) {
    return <span className={className} aria-hidden={ariaLabel ? undefined : true}>{children}</span>
  }

  return typeof fallback === 'string'
    ? <img src={fallback} alt={ariaLabel ?? ''} className={className} />
    : <span className={className} aria-label={ariaLabel}>{fallback}</span>
}

export default function Icon({ name, children, fallback, className, ariaLabel }: IconProps) {
  const [isSafari, setIsSafari] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const ref = React.useRef<HTMLSpanElement>(null)

  useEffect(() => {
    setIsSafari(isSafariAgent())
  }, [])

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            // Optionally unobserve after first intersection
            // observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 } // Trigger when 10% visible
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  if (name) {
    const content = renderLineIcon({ name, isSafari, isVisible, className, ariaLabel })
    return <span ref={ref} style={{ display: 'inline-block' }}>{content}</span>
  }

  return renderCustomIcon({ children, fallback, className, ariaLabel }, isSafari)
}

export { isSafariAgent }
