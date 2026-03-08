/**
 * Application layer barrel export.
 * Re-exports all React hooks and services.
 *
 * Usage: import { useTheme, useSoundEffects } from '@/app'
 */

export * from './storageService'
export * from './haptics'
export { ThemeProvider, useThemeContext } from './ThemeContext'
export { SoundProvider, useSoundContext } from './SoundContext'
