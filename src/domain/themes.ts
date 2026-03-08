/**
 * Theme definitions — color palettes, mode settings, colorblind presets.
 * Pure data, no DOM manipulation.
 */

export const COLOR_THEMES = ['classic', 'ocean', 'sunset', 'forest', 'rose', 'midnight', 'highcontrast'] as const
export type ColorTheme = (typeof COLOR_THEMES)[number]

export const MODES = ['system', 'light', 'dark'] as const
export type Mode = (typeof MODES)[number]

export const COLORBLIND_MODES = ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'] as const
export type ColorblindMode = (typeof COLORBLIND_MODES)[number]

export const DEFAULT_SETTINGS = {
  colorTheme: 'highcontrast' as ColorTheme,
  mode: 'system' as Mode,
  colorblind: 'none' as ColorblindMode,
}
