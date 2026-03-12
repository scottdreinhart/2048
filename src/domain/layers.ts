/**
 * Layer Manager — Visual layer stack configuration for theme composition.
 *
 * SOLID: Open/Closed Principle — add new layers or per-theme overrides here;
 * UI components read from CSS custom properties set by the app layer.
 *
 * Each layer controls: opacity, blend mode, and visibility.
 * Z-index ordering is fixed (board image → cells → marks → win line → overlays).
 */

/** Configuration for a single visual layer */
export interface LayerConfig {
  readonly opacity: number
  readonly blendMode: string
  readonly visible: boolean
}

/** Complete layer stack for a theme */
export interface LayerStack {
  readonly boardImage: LayerConfig
  readonly cells: LayerConfig
  readonly marks: LayerConfig
  readonly winLine: LayerConfig
  readonly overlay: LayerConfig
}

/** Fixed z-indices — consistent ordering across all themes */
export const LAYER_Z = {
  boardImage: 0,
  cells: 1,
  marks: 2,
  winLine: 3,
  overlay: 4,
} as const

/** Default layer stack — all layers fully visible, normal blending */
const DEFAULT_LAYER_STACK: LayerStack = {
  boardImage: { opacity: 0.9, blendMode: 'normal', visible: true },
  cells: { opacity: 1, blendMode: 'normal', visible: true },
  marks: { opacity: 1, blendMode: 'normal', visible: true },
  winLine: { opacity: 1, blendMode: 'normal', visible: true },
  overlay: { opacity: 1, blendMode: 'normal', visible: true },
}

/**
 * Per-theme layer overrides.
 * Only specify layers that differ from the default stack.
 */
const THEME_LAYER_OVERRIDES: Readonly<Record<string, Partial<LayerStack>>> = {
  highcontrast: {
    boardImage: { opacity: 0, blendMode: 'normal', visible: false },
  },
  sunset: {
    boardImage: { opacity: 0, blendMode: 'normal', visible: false },
  },
  midnight: {
    boardImage: { opacity: 0.85, blendMode: 'multiply', visible: true },
  },
}

/** Merge default stack with per-theme overrides */
export const getLayerStack = (themeId: string): LayerStack => {
  const overrides = THEME_LAYER_OVERRIDES[themeId]
  if (!overrides) {
    return DEFAULT_LAYER_STACK
  }

  return {
    boardImage: overrides.boardImage ?? DEFAULT_LAYER_STACK.boardImage,
    cells: overrides.cells ?? DEFAULT_LAYER_STACK.cells,
    marks: overrides.marks ?? DEFAULT_LAYER_STACK.marks,
    winLine: overrides.winLine ?? DEFAULT_LAYER_STACK.winLine,
    overlay: overrides.overlay ?? DEFAULT_LAYER_STACK.overlay,
  }
}

/** Convert a layer stack to CSS custom property key-value pairs */
export const layerStackToCssVars = (stack: LayerStack): Record<string, string> => ({
  '--layer-board-image-opacity': String(stack.boardImage.opacity),
  '--layer-board-image-blend': stack.boardImage.blendMode,
  '--layer-board-image-visible': stack.boardImage.visible ? 'block' : 'none',
  '--layer-cells-opacity': String(stack.cells.opacity),
  '--layer-marks-opacity': String(stack.marks.opacity),
  '--layer-win-line-opacity': String(stack.winLine.opacity),
  '--layer-overlay-opacity': String(stack.overlay.opacity),
})
