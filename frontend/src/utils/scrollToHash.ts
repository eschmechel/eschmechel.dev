export interface ScrollToHashOptions {
  /** Pixels to offset from element top (useful for fixed headers) */
  offset?: number
  /** Force behavior (overrides prefers-reduced-motion) */
  behavior?: ScrollBehavior
  /** Whether to update the browser history (pushState). Default true */
  updateHistory?: boolean
}

export function scrollToHash(hash: string, opts: ScrollToHashOptions = {}): boolean {
  if (typeof window === 'undefined' || !hash) return false

  const rawHash = hash.startsWith('#') ? hash : `#${hash}`
  const id = rawHash.slice(1)

  const el = document.getElementById(id) || document.querySelector(rawHash)
  if (!el) return false

  const prefersReduced = typeof window !== 'undefined' &&
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const behavior: ScrollBehavior = opts.behavior ?? (prefersReduced ? 'auto' : 'smooth')

  const top = (el as Element).getBoundingClientRect().top + window.pageYOffset - (opts.offset ?? 0)

  try {
    window.scrollTo({ top, behavior })
  } catch (e) {
    // fallback
    window.scrollTo(0, top)
  }

  if (opts.updateHistory ?? true) {
    try {
      const url = window.location.pathname + window.location.search + rawHash
      history.pushState(null, '', url)
    } catch (e) {
      // best-effort: set hash (may affect scroll)
      window.location.hash = rawHash
    }
  }

  return true
}

export default scrollToHash
