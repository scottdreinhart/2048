import { createContext, type ReactNode, useContext } from 'react'

import useTheme from './useTheme'

type UseThemeReturn = ReturnType<typeof useTheme>

const ThemeContext = createContext<UseThemeReturn | null>(null)

/**
 * ThemeProvider — provides theme settings via React Context, wrapping
 * the existing useTheme hook. Place at the top of the component tree.
 *
 * Usage:
 *   <ThemeProvider><App /></ThemeProvider>
 *
 *   const { settings, setColorTheme } = useThemeContext()
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme()
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

/**
 * useThemeContext — access theme settings anywhere in the tree.
 * Must be called inside a <ThemeProvider>.
 */
export function useThemeContext(): UseThemeReturn {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useThemeContext must be used within a <ThemeProvider>')
  }
  return ctx
}
