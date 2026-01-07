import * as React from "react"
import { cn } from "@/lib/utils"

interface TypographyProps {
  children?: React.ReactNode
  className?: string
}

// Factory function to create typography components
function createTypography<T extends keyof React.JSX.IntrinsicElements>(
  element: T,
  baseClasses: string
) {
  return ({ children, className, ...props }: TypographyProps & Omit<React.ComponentPropsWithoutRef<T>, 'children' | 'className'>) => {
    const Element = element
    return (
      <Element className={cn(baseClasses, className)} {...props as any}>
        {children}
      </Element>
    )
  }
}

// Display - Hero sections and major headings
export const Display = createTypography(
  "h1",
  "font-sans font-semibold text-text text-3xl tracking-wide leading-tight md:text-5xl md:leading-tight lg:leading-[1.1]"
)

// H1 - Main page heading
export const H1 = createTypography(
  "h1",
  "font-display font-bold text-text text-3xl leading-tight tracking-tight md:text-4xl md:leading-tight lg:text-5xl lg:leading-snug"
)

// H2 - Section headings
export const H2 = createTypography(
  "h2",
  "font-display font-bold text-text text-2xl leading-snug tracking-tight md:text-3xl md:leading-snug lg:text-4xl lg:leading-normal"
)

// H3 - Subsection headings
export const H3 = createTypography(
  "h3",
  "font-display font-semibold text-text text-xl leading-normal tracking-normal md:text-2xl md:leading-normal lg:text-3xl lg:leading-relaxed"
)

// H4 - Card titles, smaller headings
export const H4 = createTypography(
  "h4",
  "font-display font-semibold text-text text-lg leading-normal tracking-normal md:text-xl md:leading-normal lg:text-2xl lg:leading-relaxed"
)

// Lead - Intro paragraphs, emphasis text
export const Lead = createTypography(
  "p",
  "font-sans text-text text-lg leading-relaxed md:text-xl md:leading-relaxed lg:text-2xl lg:leading-loose"
)

// Body Large - Intro paragraphs, lead text
export const BodyLarge = createTypography(
  "p",
  "font-sans text-text text-base leading-relaxed md:text-lg md:leading-relaxed lg:text-xl lg:leading-relaxed"
)

// Body - Standard paragraphs
export const Body = createTypography(
  "p",
  "font-sans text-text text-sm leading-relaxed md:text-base md:leading-relaxed lg:text-lg lg:leading-relaxed"
)

// Body Small - Secondary text, captions
export const BodySmall = createTypography(
  "p",
  "font-sans text-text-muted text-xs leading-normal md:text-sm md:leading-normal lg:text-base lg:leading-normal"
)

// Caption - Very small text, metadata
export const Caption = createTypography(
  "span",
  "font-sans text-text-muted text-xs leading-tight tracking-wide"
)

// Label - Form labels, tags, badges
export const Label = createTypography(
  "span",
  "font-sans font-medium text-text text-sm leading-tight tracking-wide uppercase"
)

// Code - Inline code snippets
export const Code = createTypography(
  "code",
  "font-mono text-accent-300 bg-surface px-1.5 py-0.5 rounded text-sm"
)

// Quote - Pull quotes, testimonials
export const Quote = createTypography(
  "blockquote",
  "font-sans italic text-text border-l-4 border-accent-500 pl-6 text-lg leading-relaxed md:text-xl md:leading-relaxed lg:text-2xl lg:leading-loose max-w-prose"
)

// Link - Styled anchor text
export const Link = createTypography(
  "a",
  "font-sans text-accent-500 hover:text-accent-300 underline decoration-accent-500/30 underline-offset-4 hover:decoration-accent-300 transition-colors"
)

// Muted - De-emphasized text
export const Muted = createTypography(
  "p",
  "font-sans text-text-muted text-sm leading-relaxed"
)
