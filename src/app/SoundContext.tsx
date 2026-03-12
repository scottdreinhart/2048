import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { load, save } from './storageService'

interface SoundContextValue {
  /** Whether sound effects are enabled */
  soundEnabled: boolean
  /** Toggle sound on/off */
  toggleSound: () => void
  /** Set sound state directly */
  setSoundEnabled: (enabled: boolean) => void
  /** Play a sound if enabled and reduced-motion is not preferred */
  playSound: (fn: () => void) => void
}

const SoundContext = createContext<SoundContextValue | null>(null)

const STORAGE_KEY = 'sound-enabled'

/**
 * SoundProvider — provides sound-enabled state and a guarded playSound function.
 * Respects `prefers-reduced-motion` — sounds are suppressed when motion is reduced.
 *
 * Usage:
 *   <SoundProvider><App /></SoundProvider>
 *
 *   const { playSound } = useSoundContext()
 *   playSound(() => playMoveSound())
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => load(STORAGE_KEY, true))
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled)
    save(STORAGE_KEY, enabled)
  }, [])

  const toggleSound = useCallback(() => {
    setSoundEnabledState((prev) => {
      const next = !prev
      save(STORAGE_KEY, next)
      return next
    })
  }, [])

  const playSound = useCallback(
    (fn: () => void) => {
      if (soundEnabled && !prefersReducedMotion.current) {
        fn()
      }
    },
    [soundEnabled],
  )

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, setSoundEnabled, playSound }}>
      {children}
    </SoundContext.Provider>
  )
}

/**
 * useSoundContext — access sound state anywhere in the tree.
 * Must be called inside a <SoundProvider>.
 */
export function useSoundContext(): SoundContextValue {
  const ctx = useContext(SoundContext)
  if (!ctx) {
    throw new Error('useSoundContext must be used within a <SoundProvider>')
  }
  return ctx
}
