/**
 * Responsive system — centralized breakpoints, media query tokens, types,
 * and pure derived-state helpers. Framework-agnostic.
 *
 * This is the single source of truth for all responsive logic.
 * Components consume derived state via useResponsiveState() from '@/app'.
 */

// ─── Breakpoint Tokens ──────────────────────────────────────
// Defined once here; all responsive logic derives from these values.

export const RESPONSIVE_BREAKPOINTS = {
  xs: 0,
  sm: 375,
  md: 600,
  lg: 900,
  xl: 1200,
  xxl: 1800,
} as const

export const HEIGHT_THRESHOLDS = {
  short: 500,
  medium: 700,
} as const

export type BreakpointName = keyof typeof RESPONSIVE_BREAKPOINTS

// ─── Media Query Tokens ─────────────────────────────────────
// Capability-based queries. Do not scatter raw query strings in components.

export const MEDIA_QUERIES = {
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  hover: '(hover: hover)',
  coarsePointer: '(pointer: coarse), (any-pointer: coarse)',
  finePointer: '(pointer: fine)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  prefersDarkColorScheme: '(prefers-color-scheme: dark)',
  wideViewport: '(min-width: 1440px)',
  ultrawideViewport: '(min-width: 1720px)',
  shortViewport: `(max-height: ${HEIGHT_THRESHOLDS.short}px)`,
} as const

// ─── Semantic Layout Types ──────────────────────────────────

export type NavMode = 'bottom-tabs' | 'drawer' | 'sidebar' | 'topbar'
export type ContentDensity = 'compact' | 'comfortable' | 'spacious'
export type DialogMode = 'fullscreen' | 'bottom-sheet' | 'centered-modal'
export type InteractionMode = 'touch' | 'hybrid' | 'pointer-precise'

// ─── Responsive State Interfaces ────────────────────────────

/** Raw capability inputs gathered from browser APIs. */
export interface ResponsiveCapabilities {
  readonly width: number
  readonly height: number
  readonly isPortrait: boolean
  readonly isLandscape: boolean
  readonly supportsHover: boolean
  readonly hasCoarsePointer: boolean
  readonly hasFinePointer: boolean
  readonly prefersReducedMotion: boolean
  readonly prefersDarkColorScheme: boolean
}

/** Full derived responsive state consumed by components. */
export interface ResponsiveState extends ResponsiveCapabilities {
  // Breakpoint categories (mutually exclusive)
  readonly isXs: boolean
  readonly isSm: boolean
  readonly isMd: boolean
  readonly isLg: boolean
  readonly isXl: boolean
  readonly isXxl: boolean
  // Device-class semantics
  readonly isMobile: boolean
  readonly isTablet: boolean
  readonly isDesktop: boolean
  // Derived composite flags
  readonly compactViewport: boolean
  readonly shortViewport: boolean
  readonly wideViewport: boolean
  readonly ultrawideViewport: boolean
  readonly touchOptimized: boolean
  readonly denseLayoutAllowed: boolean
  readonly fullscreenDialogPreferred: boolean
  // Layout decisions
  readonly navMode: NavMode
  readonly contentDensity: ContentDensity
  readonly dialogMode: DialogMode
  readonly interactionMode: InteractionMode
  readonly gridColumns: number
}

// ─── Breakpoint Derivation ──────────────────────────────────

export function deriveBreakpointFlags(width: number) {
  const { sm, md, lg, xl, xxl } = RESPONSIVE_BREAKPOINTS
  return {
    isXs: width < sm,
    isSm: width >= sm && width < md,
    isMd: width >= md && width < lg,
    isLg: width >= lg && width < xl,
    isXl: width >= xl && width < xxl,
    isXxl: width >= xxl,
  }
}

// ─── Device Category Derivation ─────────────────────────────

export function deriveDeviceCategory(width: number) {
  const { md, lg } = RESPONSIVE_BREAKPOINTS
  return {
    isMobile: width < md,
    isTablet: width >= md && width < lg,
    isDesktop: width >= lg,
  }
}

// ─── Navigation Mode ────────────────────────────────────────
// Mobile → bottom tabs, tablet/coarse → drawer, desktop + fine → sidebar.

export function deriveNavMode(width: number, hasCoarsePointer: boolean): NavMode {
  const { md, lg } = RESPONSIVE_BREAKPOINTS
  if (width < md) {
    return 'bottom-tabs'
  }
  if (width < lg || hasCoarsePointer) {
    return 'drawer'
  }
  return 'sidebar'
}

// ─── Content Density ────────────────────────────────────────
// Short or narrow → compact, wide desktop → spacious.

export function deriveContentDensity(width: number, height: number): ContentDensity {
  if (width < RESPONSIVE_BREAKPOINTS.md || height < HEIGHT_THRESHOLDS.short) {
    return 'compact'
  }
  if (width >= RESPONSIVE_BREAKPOINTS.xl) {
    return 'spacious'
  }
  return 'comfortable'
}

// ─── Dialog Mode ────────────────────────────────────────────
// Small or short → fullscreen, mid → bottom-sheet, large → centered modal.

export function deriveDialogMode(width: number, height: number): DialogMode {
  if (width < RESPONSIVE_BREAKPOINTS.md || height < HEIGHT_THRESHOLDS.short) {
    return 'fullscreen'
  }
  if (width < RESPONSIVE_BREAKPOINTS.lg) {
    return 'bottom-sheet'
  }
  return 'centered-modal'
}

// ─── Interaction Mode ───────────────────────────────────────
// Pure touch, pure pointer, or hybrid.

export function deriveInteractionMode(
  supportsHover: boolean,
  hasCoarsePointer: boolean,
  hasFinePointer: boolean,
): InteractionMode {
  if (hasCoarsePointer && !hasFinePointer && !supportsHover) {
    return 'touch'
  }
  if (hasFinePointer && supportsHover && !hasCoarsePointer) {
    return 'pointer-precise'
  }
  return 'hybrid'
}

// ─── Grid Columns ───────────────────────────────────────────

export function deriveGridColumns(width: number): number {
  const { sm, md, lg, xl } = RESPONSIVE_BREAKPOINTS
  if (width < sm) {
    return 1
  }
  if (width < md) {
    return 1
  }
  if (width < lg) {
    return 2
  }
  if (width < xl) {
    return 3
  }
  return 4
}

// ─── Main Derivation ────────────────────────────────────────
// Single entry point: raw capabilities → full semantic state.

export function deriveResponsiveState(caps: ResponsiveCapabilities): ResponsiveState {
  const { width, height, hasCoarsePointer, hasFinePointer, supportsHover } = caps
  return {
    ...caps,
    ...deriveBreakpointFlags(width),
    ...deriveDeviceCategory(width),
    compactViewport: width < RESPONSIVE_BREAKPOINTS.md || height < HEIGHT_THRESHOLDS.short,
    shortViewport: height < HEIGHT_THRESHOLDS.short,
    wideViewport: width >= 1440,
    ultrawideViewport: width >= 1720,
    touchOptimized: hasCoarsePointer && !supportsHover,
    denseLayoutAllowed: supportsHover && hasFinePointer && width >= RESPONSIVE_BREAKPOINTS.lg,
    fullscreenDialogPreferred:
      width < RESPONSIVE_BREAKPOINTS.md || height < HEIGHT_THRESHOLDS.short,
    navMode: deriveNavMode(width, hasCoarsePointer),
    contentDensity: deriveContentDensity(width, height),
    dialogMode: deriveDialogMode(width, height),
    interactionMode: deriveInteractionMode(supportsHover, hasCoarsePointer, hasFinePointer),
    gridColumns: deriveGridColumns(width),
  }
}
