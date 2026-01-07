import * as React from 'react'
import { useEffect, useState } from 'react'
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

type LineIconName = 'briefcase' | 'map-marker' // add more as needed

interface IconProps {
  // Option 1: Use line-md icon by name
  name?: LineIconName
  // Option 2: Use custom children/fallback
  children?: React.ReactNode // preferred advanced SVG node
  fallback?: React.ReactNode | string // ReactNode or image src
  className?: string
  ariaLabel?: string
}

function renderLineIcon(name: string, isSafari: boolean, className?: string, ariaLabel?: string) {
  const iconPath = isSafari 
    ? `/src/assets/icons/${name}-static.svg`
    : `/src/assets/icons/${name}-animated.svg`
  
  const svgContent = isSafari ? staticIcons[iconPath] : animatedIcons[iconPath]

  if (!svgContent) {
    console.error(`Icon not found: ${iconPath}`)
    return null
  }

  return (
    <span 
      className={className} 
      aria-label={ariaLabel}
      dangerouslySetInnerHTML={{ __html: svgContent }}
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
      ? <img src={fallback} alt={ariaLabel ?? ''} className={className} />
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

  useEffect(() => {
    setIsSafari(isSafariAgent())
  }, [])

  if (name) {
    return renderLineIcon(name, isSafari, className, ariaLabel)
  }

  return renderCustomIcon({ children, fallback, className, ariaLabel }, isSafari)
}

export { isSafariAgent }
