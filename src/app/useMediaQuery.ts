/**
 * SSR-safe media query hook. Returns a boolean indicating whether
 * the given CSS media query currently matches.
 *
 * Uses window.matchMedia — listeners fire only when the match state
 * changes, not on every resize. Ideal for capability detection.
 */

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mql = window.matchMedia(query)
    // Sync immediately in case initial state was SSR-fallback
    setMatches(mql.matches)

    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
