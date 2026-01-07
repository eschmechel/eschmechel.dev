import * as React from 'react'
import HashLink from '@/components/ui/HashLink'

type As = 'button' | 'a' | 'hashlink'

interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  as?: As
  href?: string
  onClick?: React.EventHandler<any>
  className?: string
  disabled?: boolean
  children?: React.ReactNode
  target?: string
  rel?: string
}

export default function Button({ as = 'button', href, onClick, className, disabled, children, target, rel, ...rest }: ButtonProps) {
  if (as === 'hashlink') {
    return (
      <HashLink to={href ?? '#'} onClick={onClick as any} className={className} {...rest}>
        {children}
      </HashLink>
    )
  }

  if (as === 'a') {
    return (
      <a href={href} onClick={onClick as any} className={className} aria-disabled={disabled} target={target} rel={rel} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick as any} className={className} disabled={disabled} {...rest}>
      {children}
    </button>
  )
}
