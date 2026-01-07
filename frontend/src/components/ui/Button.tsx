import * as React from 'react'
import HashLink from '@/components/ui/HashLink'

type As = 'button' | 'a' | 'hashlink'

interface ButtonProps {
  as?: As
  href?: string
  onClick?: React.EventHandler<any>
  className?: string
  disabled?: boolean
  children?: React.ReactNode
}

export default function Button({ as = 'button', href, onClick, className, disabled, children }: ButtonProps) {
  if (as === 'hashlink') {
    return (
      <HashLink to={href ?? '#'} onClick={onClick as any} className={className}>
        {children}
      </HashLink>
    )
  }

  if (as === 'a') {
    return (
      <a href={href} onClick={onClick as any} className={className} aria-disabled={disabled}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick as any} className={className} disabled={disabled}>
      {children}
    </button>
  )
}
