/**
 * useSwipe — touch/swipe gesture handler for mobile controls.
 * Detects directional swipes on the document and maps them to game directions.
 *
 * Usage: useSwipe(onSwipe, enabled)
 * - onSwipe: callback with direction ('left' | 'right' | 'up' | 'down')
 * - enabled: boolean to toggle the gesture handler
 */

import { useCallback, useEffect, useRef } from 'react'

type SwipeDirection = 'left' | 'right' | 'up' | 'down'

const MIN_SWIPE_DISTANCE = 20

export function useSwipe(onSwipe: (direction: SwipeDirection) => void, enabled: boolean): void {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const onSwipeRef = useRef(onSwipe)

  // Keep callback reference in sync without triggering deps
  onSwipeRef.current = onSwipe

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return

    const touch = e.touches[0]
    if (!touch) return

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    }
  }, [enabled])

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !touchStartRef.current) {
        return
      }

      const touch = e.changedTouches[0]
      if (!touch) {
        touchStartRef.current = null
        return
      }

      const dx = touch.clientX - touchStartRef.current.x
      const dy = touch.clientY - touchStartRef.current.y
      touchStartRef.current = null

      // Ignore swipes below minimum distance threshold
      if (Math.abs(dx) < MIN_SWIPE_DISTANCE && Math.abs(dy) < MIN_SWIPE_DISTANCE) {
        return
      }

      // Prevent default browser behaviors (scroll bounce, etc.)
      e.preventDefault()

      // Determine direction based on dominant axis
      if (Math.abs(dx) > Math.abs(dy)) {
        onSwipeRef.current(dx > 0 ? 'right' : 'left')
      } else {
        onSwipeRef.current(dy > 0 ? 'down' : 'up')
      }
    },
    [enabled],
  )

  useEffect(() => {
    if (!enabled) {
      return
    }

    // Use passive: true for touchstart (for scroll perf)
    // Use passive: false for touchend (to allow preventDefault)
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, handleTouchStart, handleTouchEnd])
}
