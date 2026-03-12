/**
 * Application layer barrel export.
 * Re-exports all React hooks and services.
 *
 * Usage: import { useTheme, useSoundEffects } from '@/app'
 */

export * from './haptics'
export { SoundProvider, useSoundContext } from './SoundContext'
export * from './storageService'
export { ThemeProvider, useThemeContext } from './ThemeContext'
export { useOnlineStatus } from './useOnlineStatus'
export { useStats } from './useStats'
