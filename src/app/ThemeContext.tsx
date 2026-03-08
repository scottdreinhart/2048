import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_SETTINGS } from '@/domain/themes'
import type { ColorTheme, Mode, ColorblindMode } from '@/domain/themes'
import { load, save } from './storageService'

interface ThemeContextValue {
  colorTheme: ColorTheme
  mode: Mode
  colorblind: ColorblindMode
  setColorTheme: (theme: ColorTheme) => void
  setMode: (mode: Mode) => void
  setColorblind: (mode: ColorblindMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'theme-settings'

interface ThemeSettings {
  colorTheme: ColorTheme
  mode: Mode
  colorblind: ColorblindMode
}

/**
 * ThemeProvider — provides theme, mode, and colorblind settings via React Context.
 * Persists to localStorage and syncs data attributes to the document root.
 *
 * Wrap at the top of the component tree (in index.tsx or App):
 *   <ThemeProvider><App /></ThemeProvider>
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const stored = load<ThemeSettings>(STORAGE_KEY, DEFAULT_SETTINGS)
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(stored.colorTheme)
  const [mode, setModeState] = useState<Mode>(stored.mode)
  const [colorblind, setColorblindState] = useState<ColorblindMode>(stored.colorblind)

  // Sync to DOM
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', colorTheme)
    root.setAttribute('data-mode', mode)
    root.setAttribute('data-colorblind', colorblind)
    save(STORAGE_KEY, { colorTheme, mode, colorblind })
  }, [colorTheme, mode, colorblind])

  const setColorTheme = useCallback((t: ColorTheme) => setColorThemeState(t), [])
  const setMode = useCallback((m: Mode) => setModeState(m), [])
  const setColorblind = useCallback((c: ColorblindMode) => setColorblindState(c), [])

  return (
    <ThemeContext.Provider
      value={{ colorTheme, mode, colorblind, setColorTheme, setMode, setColorblind }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * useThemeContext — access theme settings anywhere in the tree.
 * Must be called inside a <ThemeProvider>.
 */
export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeContext must be used within a <ThemeProvider>')
  return ctx
}
