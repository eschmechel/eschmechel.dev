import * as React from 'react'
import { forwardRef } from 'react'
import scrollToHash from '@/utils/scrollToHash'

interface HashLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string
  /** Optional offset to account for fixed headers */
  offset?: number
}

const HashLink = forwardRef<HTMLAnchorElement, HashLinkProps>(function HashLink({ to, offset, onClick, children, ...props }, ref) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e as any)
    if (e.defaultPrevented) return

    // if `to` contains a hash, handle client-side scroll without full page reload
    const isHash = to.includes('#')
    if (isHash) {
      e.preventDefault()
      const [, hash] = to.split('#')
      const rawHash = hash ? `#${hash}` : '#'
      // update history + scroll
      try {
        const url = to.startsWith('#') ? window.location.pathname + window.location.search + rawHash : to
        history.pushState(null, '', url)
      } catch (err) {
        // ignore
      }
      scrollToHash(rawHash, { offset })
    }
  }

  return (
    <a ref={ref} href={to} onClick={handleClick as any} {...props}>
      {children}
    </a>
  )
})

export default HashLink
