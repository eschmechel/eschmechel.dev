import * as React from 'react'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

type Variant = 'solid' | 'transparent' | 'ghost' | 'highlight'
type ClassName = string
type CSSClass = string
type Hash = string

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  /** Tailwind classes for the fill (applied to the animated background) */
  fillClass?: CSSClass
  /** Tailwind classes for the text/content */
  textClass?: CSSClass
  /** Render as link when provided */
  href?: string
  /** Optional hash target to scroll to (e.g. "#about"). If provided, click will scroll smoothly. */
  scrollToHash?: Hash
  /** Optional override handler when a scrollToHash is provided */
  onHashClick?: (hash: Hash, e: React.MouseEvent) => void
  /** target attribute for links (e.g. "_blank") */
  target?: string
  /** rel attribute for links (e.g. "noopener noreferrer") */
  rel?: string
}

const base = 'inline-flex items-center justify-center gap-2 relative overflow-hidden select-none rounded-md px-4 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

function getVariantClasses(variant: Variant): ClassName {
  return {
    solid: cn('bg-transparent text-current', ''),
    transparent: cn('bg-transparent text-current border border-current'),
    ghost: cn('bg-transparent text-current border border-current'),
    highlight: cn('bg-transparent text-current'),
  }[variant as Variant]
}

function getFillSpanClass(fillClass: CSSClass): ClassName {
  return cn(
    'absolute inset-0 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out',
    'group-hover:brightness-105',
    fillClass
  )
}

function getGlowSpanClass(variant: Variant, fillClass: CSSClass): ClassName | undefined {
  if (variant !== 'highlight') return undefined
  return cn(
    'absolute -inset-2 rounded-md blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',
    fillClass
  )
}

function renderInnerContent(children: React.ReactNode, contentClass: ClassName, fillSpan: ClassName, glowSpanClass?: ClassName) {
  return (
    <>
      {glowSpanClass && <span aria-hidden className={glowSpanClass} />}
      <span aria-hidden className={fillSpan} />
      <span className={contentClass}>{children}</span>
    </>
  )
}

function createScrollHandler(scrollToHash?: Hash, onHashClick?: (hash: Hash, e: React.MouseEvent) => void) {
  return (e: React.MouseEvent) => {
    if (!scrollToHash) return
    e.preventDefault()
    
    if (onHashClick) {
      onHashClick(scrollToHash, e)
      return
    }
    
    scrollToElement(scrollToHash)
  }
}

function scrollToElement(hash: Hash) {
  try {
    const id = hash.startsWith('#') ? hash.slice(1) : hash
    const el = document.getElementById(id) || document.querySelector(hash)
    
    if (el && 'scrollIntoView' in el) {
      ;(el as Element).scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.hash = hash
    }
  } catch (err) {
    // ignore
  }
}

function getElementType(href?: string, scrollToHash?: Hash): 'button' | 'a' | 'hashlink' {
  if (!href) return 'button'
  const isHash = scrollToHash || href.startsWith('#') || href.includes('#')
  return isHash ? 'hashlink' : 'a'
}

const VariantButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(function VariantButton(
  { variant = 'solid', fillClass = 'bg-accent-600', textClass = 'text-white', className, children, disabled, href, scrollToHash, onHashClick, target, rel, ...rest },
  _ref
) {
  const variantClasses = getVariantClasses(variant)
  const fillSpan = getFillSpanClass(fillClass)
  const glowSpanClass = getGlowSpanClass(variant, fillClass)
  const contentClass = cn('relative z-10', textClass)
  const handleClick = createScrollHandler(scrollToHash, onHashClick)
  const commonClass = cn('group', base, variantClasses, className)
  const as = getElementType(href, scrollToHash)
  const finalClass = as === 'button' ? commonClass : cn('group inline-block', base, variantClasses, className)

  return (
    <Button as={as} href={href} onClick={handleClick as any} className={finalClass} disabled={disabled} target={target} rel={rel} {...rest}>
      {renderInnerContent(children, contentClass, fillSpan, glowSpanClass)}
    </Button>
  )
})

export default VariantButton
