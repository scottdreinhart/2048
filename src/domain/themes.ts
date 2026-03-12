/**
 * Theme definitions — color palettes, mode settings, colorblind presets.
 * Pure data, no DOM manipulation.
 */

import type { ColorblindMode, ColorTheme, ThemeSettings } from './types.ts'

export const COLOR_THEMES: readonly ColorTheme[] = [
  { id: 'classic', label: 'Classic', accent: '#667eea' },
  { id: 'ocean', label: 'Ocean', accent: '#0ea5e9' },
  { id: 'sunset', label: 'Sunset', accent: '#f97316' },
  { id: 'forest', label: 'Forest', accent: '#22c55e' },
  { id: 'rose', label: 'Rose', accent: '#f43f5e' },
  { id: 'midnight', label: 'Midnight', accent: '#a78bfa' },
  { id: 'highcontrast', label: 'High Contrast', accent: '#ffcc00' },
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
  colorTheme: 'highcontrast',
  mode: 'system',
  colorblind: 'none',
}
