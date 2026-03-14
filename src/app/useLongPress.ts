import { useCallback, useRef } from 'react'

interface LongPressConfig {
  duration?: number // ms before triggering (default 500ms)
  onLongPress: () => void
  onLongPressEnd?: () => void
}

/**
 * Detects long-press gestures on both touch and mouse devices
 * @param config Configuration for long-press detection
 * @returns Touch and mouse event handlers
 */
export const useLongPress = ({ duration = 500, onLongPress, onLongPressEnd }: LongPressConfig) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pressStartedRef = useRef(false)

  const handleTouchStart = useCallback(() => {
    pressStartedRef.current = true
    timerRef.current = window.setTimeout(() => {
      if (pressStartedRef.current) {
        onLongPress()
      }
    }, duration)
  }, [duration, onLongPress])

  const handleTouchEnd = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }
    if (pressStartedRef.current) {
      pressStartedRef.current = false
      if (onLongPressEnd) {
        onLongPressEnd()
      }
    }
  }, [onLongPressEnd])

  const handleMouseDown = useCallback(() => {
    handleTouchStart()
  }, [handleTouchStart])

  const handleMouseUp = useCallback(() => {
    handleTouchEnd()
  }, [handleTouchEnd])

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
  }
}
