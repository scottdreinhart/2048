/**
 * Centralized responsive hook — the project's single entry point for
 * all responsive/adaptive UI decisions.
 *
 * Migrated to useSyncExternalStore with RAF-batched updates for optimal
 * performance. Coordinates all media-query listeners and viewport changes
 * into a single store subscription rather than triggering N renders.
 *
 * Components consume this object instead of writing their own ad-hoc
 * breakpoint logic.
 */

import { useSyncExternalStore } from 'react'
import { MEDIA_QUERIES, deriveResponsiveState } from '@/domain/responsive'
import type { ResponsiveCapabilities, ResponsiveState } from '@/domain/responsive'

// ─── Server & Snapshot Defaults ──────────────────────────────

const getDefaultCapabilities = (): ResponsiveCapabilities => ({
  width: 1440,
  height: 900,
  isPortrait: false,
  isLandscape: true,
  supportsHover: true,
  hasCoarsePointer: false,
  hasFinePointer: true,
  prefersReducedMotion: false,
  prefersDarkColorScheme: false,
})

// ─── Media Query Subscription ────────────────────────────────

type MediaQueryKey = keyof typeof MEDIA_QUERIES

const getMediaQueryMatches = (): Record<MediaQueryKey, boolean> => {
  if (typeof window === 'undefined') {
    return {} as Record<MediaQueryKey, boolean>
  }

  const matches = {} as Record<MediaQueryKey, boolean>
  for (const [key, query] of Object.entries(MEDIA_QUERIES)) {
    matches[key as MediaQueryKey] = window.matchMedia(query).matches
  }
  return matches
}

const getCapabilitiesFromMediaQueries = (mqMatches: Record<MediaQueryKey, boolean>): ResponsiveCapabilities => {
  const defaults = getDefaultCapabilities()
  return {
    width: typeof window !== 'undefined' ? window.innerWidth : defaults.width,
    height: typeof window !== 'undefined' ? window.innerHeight : defaults.height,
    isPortrait: mqMatches.portrait ?? defaults.isPortrait,
    isLandscape: mqMatches.landscape ?? defaults.isLandscape,
    supportsHover: mqMatches.hover ?? defaults.supportsHover,
    hasCoarsePointer: mqMatches.coarsePointer ?? defaults.hasCoarsePointer,
    hasFinePointer: mqMatches.finePointer ?? defaults.hasFinePointer,
    prefersReducedMotion: mqMatches.reducedMotion ?? defaults.prefersReducedMotion,
    prefersDarkColorScheme: mqMatches.prefersDarkColorScheme ?? defaults.prefersDarkColorScheme,
  }
}

// ─── Snapshot Caching with Equality Check ──────────────────

// Cached snapshot to prevent infinite loops in useSyncExternalStore
let cachedSnapshot: ResponsiveState | null = null

// Only update cache if values actually changed
const updateCachedSnapshot = (): void => {
  const mqMatches = getMediaQueryMatches()
  const capabilities = getCapabilitiesFromMediaQueries(mqMatches)
  const newSnapshot = deriveResponsiveState(capabilities)

  // Only update cache if this is first time or values actually changed
  if (cachedSnapshot === null || !areSnapshotsEqual(cachedSnapshot, newSnapshot)) {
    cachedSnapshot = newSnapshot
  }
}

// Deep equality check for responsive state
const areSnapshotsEqual = (a: ResponsiveState, b: ResponsiveState): boolean => {
  return (
    a.width === b.width &&
    a.height === b.height &&
    a.isPortrait === b.isPortrait &&
    a.isLandscape === b.isLandscape &&
    a.supportsHover === b.supportsHover &&
    a.hasCoarsePointer === b.hasCoarsePointer &&
    a.hasFinePointer === b.hasFinePointer &&
    a.prefersReducedMotion === b.prefersReducedMotion &&
    a.prefersDarkColorScheme === b.prefersDarkColorScheme &&
    a.isXs === b.isXs &&
    a.isSm === b.isSm &&
    a.isMd === b.isMd &&
    a.isLg === b.isLg &&
    a.isXl === b.isXl &&
    a.isXxl === b.isXxl &&
    a.isMobile === b.isMobile &&
    a.isTablet === b.isTablet &&
    a.isDesktop === b.isDesktop &&
    a.compactViewport === b.compactViewport &&
    a.shortViewport === b.shortViewport &&
    a.wideViewport === b.wideViewport &&
    a.ultrawideViewport === b.ultrawideViewport &&
    a.touchOptimized === b.touchOptimized &&
    a.denseLayoutAllowed === b.denseLayoutAllowed &&
    a.fullscreenDialogPreferred === b.fullscreenDialogPreferred &&
    a.navMode === b.navMode &&
    a.contentDensity === b.contentDensity &&
    a.dialogMode === b.dialogMode &&
    a.interactionMode === b.interactionMode &&
    a.gridColumns === b.gridColumns
  )
}

// ─── Subscription Function (RAF-Batched) ────────────────────

const subscribeResponsiveState = (listener: () => void): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {}
  }

  // Initialize snapshot on first subscription
  updateCachedSnapshot()
  let previousSnapshot = cachedSnapshot

  let frameId = 0
  const scheduleUpdate = () => {
    window.cancelAnimationFrame(frameId)
    frameId = window.requestAnimationFrame(() => {
      updateCachedSnapshot()
      // Only notify listener if snapshot reference changed (equality already checked in updateCachedSnapshot)
      if (cachedSnapshot !== previousSnapshot) {
        previousSnapshot = cachedSnapshot
        listener()
      }
    })
  }

  // Setup media query listeners with fallback for older browsers
  const mediaQueryLists = Object.entries(MEDIA_QUERIES).map(([, query]) =>
    window.matchMedia(query),
  )

  // Browser resize & orientation change
  window.addEventListener('resize', scheduleUpdate, { passive: true })
  window.addEventListener('orientationchange', scheduleUpdate, { passive: true })

  // Media query changes
  for (const mql of mediaQueryLists) {
    if ('addEventListener' in mql) {
      mql.addEventListener('change', scheduleUpdate, { passive: true })
    } else {
      // Fallback for older browsers
      ;(mql as any).addListener(scheduleUpdate)
    }
  }

  // Cleanup function
  return () => {
    window.cancelAnimationFrame(frameId)
    window.removeEventListener('resize', scheduleUpdate)
    window.removeEventListener('orientationchange', scheduleUpdate)

    for (const mql of mediaQueryLists) {
      if ('removeEventListener' in mql) {
        mql.removeEventListener('change', scheduleUpdate)
      } else {
        ;(mql as any).removeListener(scheduleUpdate)
      }
    }
  }
}

// ─── Snapshot Functions ──────────────────────────────────────

const getClientSnapshot = (): ResponsiveState => {
  if (cachedSnapshot === null) {
    updateCachedSnapshot()
  }
  return cachedSnapshot!
}

const getServerSnapshot = (): ResponsiveState => {
  const defaults = getDefaultCapabilities()
  return deriveResponsiveState(defaults)
}

// ─── Hook Export ────────────────────────────────────────────

export function useResponsiveState(): ResponsiveState {
  return useSyncExternalStore(subscribeResponsiveState, getClientSnapshot, getServerSnapshot)
}

export type { ResponsiveState }
