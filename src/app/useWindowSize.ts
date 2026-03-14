/**
 * SSR-safe window size hook. Returns current viewport width and height.
 *
 * Use this only when exact pixel dimensions are needed (canvas sizing,
 * pixel math, drag bounds). For semantic layout decisions, prefer
 * media queries via useResponsiveState().
 */

import { useEffect, useState } from 'react'

export interface WindowSize {
  readonly width: number
  readonly height: number
}

function getSize(): WindowSize {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 }
  }
  return { width: window.innerWidth, height: window.innerHeight }
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState(getSize)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const onResize = () => setSize(getSize())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return size
}
