/**
 * Theme definitions — color palettes, mode settings, colorblind presets.
 * Pure data, no DOM manipulation.
 */

import type { ColorblindMode, ColorTheme, ThemeSettings } from './types.ts'

export const COLOR_THEMES: readonly ColorTheme[] = [
  { id: 'chiba-city', label: 'Chiba City', accent: '#00ff41' },
  { id: 'neon-core', label: 'Neon Core', accent: '#667eea' },
  { id: 'neon-arcade', label: 'Neon Arcade', accent: '#0ea5e9' },
  { id: 'night-district', label: 'Night District', accent: '#f97316' },
  { id: 'gridline', label: 'Gridline', accent: '#22c55e' },
  { id: 'vaporwave', label: 'Vaporwave', accent: '#f43f5e' },
  { id: 'synthwave', label: 'Synthwave', accent: '#a78bfa' },
  { id: 'high-contrast', label: 'High Contrast', accent: '#ffcc00' },
]

export const MODES = ['system', 'light', 'dark'] as const
export type Mode = (typeof MODES)[number]

export const COLORBLIND_MODES: readonly ColorblindMode[] = [
  { id: 'none', label: 'Standard' },
  { id: 'protanopia', label: 'Red Weakness', description: 'Protanopia' },
  { id: 'deuteranopia', label: 'Green Weakness', description: 'Deuteranopia' },
  { id: 'tritanopia', label: 'Blue Weakness', description: 'Tritanopia' },
  { id: 'achromatopsia', label: 'Monochrome', description: 'Complete Achromatopsia' },
]

export const DEFAULT_SETTINGS: ThemeSettings = {
  colorTheme: 'chiba-city',
  mode: 'system',
  colorblind: 'none',
}
