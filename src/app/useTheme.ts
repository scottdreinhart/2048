/**
 * Theme / mode / colorblind persistence + DOM sync.
 */

import { useCallback, useEffect, useState } from 'react'

import { getLayerStack, layerStackToCssVars } from '../domain/layers.ts'
import { getBackgroundCssValue, preloadAllSprites } from '../domain/sprites.ts'
import { COLOR_THEMES, DEFAULT_SETTINGS } from '../domain/themes.ts'
import type { ThemeSettings } from '../domain/types.ts'
import { load, save } from './storageService.ts'

const STORAGE_KEY = '2048-theme-settings'

const themeLoaders = import.meta.glob('../themes/*.css', {
  query: '?inline',
  import: 'default',
}) as Record<string, () => Promise<string>>

let activeThemeStyle: HTMLStyleElement | null = null
const preloadedThemes = new Map<string, string>()

const preloadTheme = async (themeId: string): Promise<void> => {
  if (preloadedThemes.has(themeId) || themeId === 'classic') {
    return
  }

  const loader = themeLoaders[`../themes/${themeId}.css`]
  if (loader) {
    try {
      const css = await loader()
      preloadedThemes.set(themeId, css)
    } catch {
      // Theme file not found — skip preload
    }
  }
}

const preloadAllThemes = (): void => {
  COLOR_THEMES.forEach(({ id }) => {
    if (id !== 'classic') {
      preloadTheme(id).catch(() => {})
    }
  })
}

const applyThemeCSS = async (themeId: string): Promise<void> => {
  if (activeThemeStyle) {
    activeThemeStyle.remove()
    activeThemeStyle = null
  }
  if (themeId === 'classic') {
    return
  }

  let css = preloadedThemes.get(themeId)
  if (!css) {
    const loader = themeLoaders[`../themes/${themeId}.css`]
    if (!loader) {
      return
    }
    css = await loader()
  }

  const el = document.createElement('style')
  el.setAttribute('data-theme-chunk', themeId)
  el.textContent = css
  document.head.appendChild(el)
  activeThemeStyle = el
}

const loadSettings = (): ThemeSettings => {
  const parsed = load<ThemeSettings>(STORAGE_KEY, DEFAULT_SETTINGS)
  return { ...DEFAULT_SETTINGS, ...parsed }
}

const saveSettings = (settings: ThemeSettings): void => {
  save(STORAGE_KEY, settings)
}

const applyToDOM = (settings: ThemeSettings): void => {
  const root = document.documentElement

  root.setAttribute('data-theme', settings.colorTheme)

  if (settings.mode === 'system') {
    root.removeAttribute('data-mode')
  } else {
    root.setAttribute('data-mode', settings.mode)
  }

  if (settings.colorblind === 'none') {
    root.removeAttribute('data-colorblind')
  } else {
    root.setAttribute('data-colorblind', settings.colorblind)
  }

  // Sprite Manager — set background image from central registry
  root.style.setProperty('--bg-image', getBackgroundCssValue(settings.colorTheme))

  // Layer Manager — apply layer stack CSS custom properties
  const layerVars = layerStackToCssVars(getLayerStack(settings.colorTheme))
  for (const [prop, value] of Object.entries(layerVars)) {
    root.style.setProperty(prop, value)
  }
}

export interface UseThemeReturn {
  settings: ThemeSettings
  setColorTheme: (id: string) => void
  setMode: (mode: string) => void
  setColorblind: (id: string) => void
}

const useTheme = (): UseThemeReturn => {
  const [settings, setSettings] = useState<ThemeSettings>(loadSettings)

  useEffect(() => {
    preloadAllThemes()
    preloadAllSprites()
  }, [])

  useEffect(() => {
    applyToDOM(settings)
    applyThemeCSS(settings.colorTheme)
    saveSettings(settings)
  }, [settings])

  const setColorTheme = useCallback((id: string) => {
    setSettings((prev) => ({ ...prev, colorTheme: id }))
  }, [])

  const setMode = useCallback((mode: string) => {
    setSettings((prev) => ({ ...prev, mode }))
  }, [])

  const setColorblind = useCallback((id: string) => {
    setSettings((prev) => ({ ...prev, colorblind: id }))
  }, [])

  return { settings, setColorTheme, setMode, setColorblind }
}

export default useTheme
