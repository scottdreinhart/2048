import { useMemo } from 'react'
import { useMediaQuery } from './useMediaQuery'
import { useWindowSize } from './useWindowSize'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export interface DeviceInfo {
  type: DeviceType
  isTouch: boolean
  isLandscape: boolean
  hasFinePointer: boolean
}

export function useDeviceInfo(): DeviceInfo {
  const { width, height } = useWindowSize()
  const hasFinePointer = useMediaQuery('(pointer: fine)')
  const prefersTouch = useMediaQuery('(pointer: coarse)')

  return useMemo(() => {
    const type: DeviceType = width > 0 && width < 640 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'
    const isTouch =
      prefersTouch ||
      (typeof window !== 'undefined' && ('ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0))

    return {
      type,
      isTouch,
      isLandscape: width > height,
      hasFinePointer,
    }
  }, [width, height, hasFinePointer, prefersTouch])
}
