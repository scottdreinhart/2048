# Responsive UI/UX Instructions

> **Scope**: Responsive design, viewport adaptation, breakpoints, device-aware hooks.
> Subordinate to `AGENTS.md` §3 (architecture) — domain logic is framework-agnostic.

---

## Architecture

| Concern | Layer | File | Purpose |
|---|---|---|---|
| Breakpoint tokens | Domain | `src/domain/responsive.ts` | Single source of truth for all breakpoint values |
| Media query tokens | Domain | `src/domain/responsive.ts` | Capability-based CSS media query strings |
| Semantic types | Domain | `src/domain/responsive.ts` | `NavMode`, `ContentDensity`, `DialogMode`, `InteractionMode` |
| Derivation functions | Domain | `src/domain/responsive.ts` | Pure functions: capabilities → semantic state |
| Tests | Domain | `src/domain/responsive.test.ts` | 40+ tests covering all derivations and boundaries |
| Media query hook | App | `src/app/useMediaQuery.ts` | SSR-safe `matchMedia` wrapper (event-driven) |
| Window size hook | App | `src/app/useWindowSize.ts` | SSR-safe `innerWidth`/`innerHeight` (resize-driven) |
| Responsive hook | App | `src/app/useResponsiveState.ts` | Centralized entry point combining all capabilities |
| UI breakpoints | UI | `src/ui/ui-constants.ts` | Re-exports domain breakpoints for component use |

---

## Single Entry Point

Components consume `useResponsiveState()` — never raw `matchMedia`, `innerWidth`, or ad-hoc breakpoint checks.

```tsx
const { compactViewport, navMode, touchOptimized } = useResponsiveState()
```

---

## Breakpoint Tokens

| Token | Width (px) | Device Class |
|---|---|---|
| `xs` | 0 | Small phone |
| `sm` | 375 | Phone |
| `md` | 600 | Tablet / mobile boundary |
| `lg` | 900 | Desktop boundary |
| `xl` | 1200 | Wide desktop |
| `xxl` | 1800 | Ultrawide |

Height thresholds: `short` (500px), `medium` (700px).

---

## ResponsiveState Fields

### Breakpoint Flags (mutually exclusive)
`isXs`, `isSm`, `isMd`, `isLg`, `isXl`, `isXxl`

### Device Categories (mutually exclusive)
`isMobile` (< md), `isTablet` (md–lg), `isDesktop` (≥ lg)

### Composite Flags
`compactViewport`, `shortViewport`, `wideViewport`, `ultrawideViewport`, `touchOptimized`, `denseLayoutAllowed`, `fullscreenDialogPreferred`

### Layout Modes
`navMode` (bottom-tabs / drawer / sidebar), `contentDensity` (compact / comfortable / spacious), `dialogMode` (fullscreen / bottom-sheet / centered-modal), `interactionMode` (touch / hybrid / pointer-precise), `gridColumns` (1–4)

### Raw Capabilities
`width`, `height`, `isPortrait`, `isLandscape`, `supportsHover`, `hasCoarsePointer`, `hasFinePointer`, `prefersReducedMotion`

---

## SSR Safety

Both `useMediaQuery` and `useWindowSize` guard with `typeof window !== 'undefined'`. Default: `false` for queries, `{ width: 0, height: 0 }` for dimensions.

---

## Performance Rules

1. `useMediaQuery` — event-driven via `matchMedia('change')`. Does **not** fire on every resize.
2. `useWindowSize` — fires on resize. Use only when exact pixel dimensions are needed.
3. `useResponsiveState` — `useMemo` prevents re-derivation when inputs are stable.

---

## Rules

1. **Never scatter raw breakpoint values** in components — import from `@/domain/responsive`.
2. **Never use `window.innerWidth` directly** — use `useResponsiveState()` or `useWindowSize()`.
3. **Domain functions must stay pure** — no React, no browser APIs.
4. **Add tests** for any new derivation function in `responsive.test.ts`.
5. **One hook** — extend `ResponsiveState` rather than creating parallel responsive hooks.

---

## Component-Level CSS & Responsive Patterns

> **Scope**: How to implement responsive layouts in component CSS modules and inline styles.
> Combined approach: **Media queries for static variants + inline styles for dynamic values**.

### 5-Device-Tier Semantic Architecture

Rather than ad-hoc breakpoints, design for 5 semantic device classes:

```
Mobile         Tablet         Desktop        Widescreen     Ultrawide
(xs/sm)        (md)           (lg)           (xl)           (xxl)
<600px         600–899px      900–1199px     1200–1799px    1800px+
────────────────────────────────────────────────────────────────────
• Single col   • Multi-col    • Full UI       • Extra space  • Maximum
• Compact      • Balanced     • Generous      • Premium      • space
• Touch focus  • Hybrid       • Pointer focus • Refined      • Refinement
```

### CSS Media Query Organization

Use CSS Modules with organized media query blocks:

```css
/* Base styles for all devices */
.button {
  padding: 1rem;
  font-size: 1rem;
}

/* Mobile: max-width 599px */
@media (max-width: 599px) {
  .button {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
}

/* Tablet: 600–899px */
@media (min-width: 600px) and (max-width: 899px) {
  .button {
    padding: 0.9rem;
    font-size: 0.95rem;
  }
}

/* Desktop: 900–1199px */
@media (min-width: 900px) {
  .button {
    padding: 1.2rem;
    font-size: 1.1rem;
  }
}

/* Ultrawide: 1800px+ */
@media (min-width: 1800px) {
  .button {
    padding: 1.4rem;
    font-size: 1.2rem;
  }
}

/* Touch device optimization */
@media (pointer: coarse) {
  .button:hover {
    transform: none;  /* Disable hover animations */
  }
}
```

### Inline Styles for Dynamic Responsive Values

Use `useResponsiveState()` in TSX to inject responsive values that depend on multiple state properties:

```tsx
const responsive = useResponsiveState()

return (
  <div
    className={styles.container}
    style={{
      padding: responsive.contentDensity === 'compact' ? '1rem' : '1.5rem',
      gap: responsive.contentDensity === 'spacious' ? '2rem' : '1rem',
      maxWidth: responsive.isMobile ? '90vw' : '700px',
      flexDirection: responsive.isDesktop ? 'row' : 'column',
    }}
  >
    {/* Content */}
  </div>
)
```

**When to use inline styles:**
- Values derived from multiple `ResponsiveState` flags
- Conditional layout changes (direction, max-width, sizing)
- Content density / interaction mode awareness
- Dynamic calculations that require component state

**When to use media queries:**
- Static typography changes per tier (font-size, line-height)
- Padding/margin increments by device class
- Border radius or shadow adjustments
- Animation timing or transform disabling (touch devices)

### Content Density Awareness

Apply `contentDensity` enum to control spacing throughout the component:

```tsx
const responsive = useResponsiveState()

// contentDensity: 'compact' | 'comfortable' | 'spacious'
// Maps to: mobile/short | tablet | desktop xl+

const buttonPadding = responsive.contentDensity === 'compact' ? '0.75rem' : '1rem'
const sectionGap = responsive.contentDensity === 'spacious' ? '2rem' : '1.5rem'
const fontSize = responsive.contentDensity === 'compact' ? '0.9rem' : '1rem'
```

### Touch Device Optimization

Always disable hover-based interactions on coarse pointer devices:

```css
/* Base hover state */
.button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Disable on touch devices */
@media (pointer: coarse) {
  .button:hover {
    background: transparent;
    transform: none;
  }
}
```

Guardrail: Never use `:hover` without a corresponding `@media (pointer: coarse)` fallback.

### Examples from Implemented Components

#### MainMenu Responsive Pattern

```tsx
// Extract responsive state
const responsive = useResponsiveState()

// Use device class and density for layout decisions
<div
  className={styles.buttons}
  style={{
    flexDirection: responsive.isDesktop ? 'row' : 'column',  // Inline for layout
    gap: responsive.contentDensity === 'compact' ? '0.75rem' : '1rem',
  }}
>
  <button
    className={styles.primaryBtn}
    style={{
      flex: responsive.isDesktop ? 1 : 'none',  // Flex on desktop
      padding: responsive.contentDensity === 'compact' ? '0.9rem' : '1.2rem',
      fontSize: responsive.contentDensity === 'compact' ? '1rem' : '1.2rem',
    }}
  >
    Play vs AI
  </button>
</div>
```

CSS Module handles static variants:

```css
@media (max-width: 599px) {
  .buttons { gap: 0.75rem; max-width: 100%; }
  .primaryBtn { padding: 0.9rem; font-size: 1rem; }
}

@media (min-width: 900px) {
  .buttons { gap: 1.2rem; }
  .primaryBtn { padding: 1.2rem; font-size: 1.1rem; }
}
```

#### GameBoard Responsive Pattern

```tsx
const responsive = useResponsiveState()

// Dynamic board sizing based on device tier
const getBoardMaxWidth = (): string => {
  if (responsive.isMobile) return '90vw'
  if (responsive.isTablet) return '500px'
  if (responsive.isDesktop && !responsive.wideViewport) return '600px'
  return '700px'
}

<div
  className={styles.root}
  style={{
    maxWidth: getBoardMaxWidth(),
    padding: responsive.contentDensity === 'compact' ? '1rem' : '1.5rem',
  }}
>
```

#### HamburgerMenu Responsive Pattern

```tsx
const responsive = useResponsiveState()

// Adaptive panel sizing based on device and density
const getPanelMaxWidth = (): string => {
  if (responsive.isMobile) return 'min(90vw, 320px)'
  if (responsive.isTablet) return 'min(85vw, 400px)'
  return 'min(80vw, 480px)'
}

<div
  ref={panelRef}
  style={{
    maxWidth: getPanelMaxWidth(),
    padding: responsive.contentDensity === 'compact' ? '1rem' : '1.5rem',
    gap: responsive.contentDensity === 'compact' ? '1rem' : '1.5rem',
  }}
>
```

### CSS Module Breakpoint Guardrails

**Rules:**

1. **Organize breakpoints consistently** — always use ascending order: mobile → tablet → desktop → ultrawide
2. **Group related rules** — keep all button styles together, all typography together, etc.
3. **Comment breakpoint ranges** — explicitly label what each breakpoint targets
4. **Use semantic selectors** — `.root`, `.button`, `.card` (not `.sm`, `.lg`)
5. **Never duplicate breakpoint values** — import from `@/domain/responsive` when needed
6. **Keep media queries in CSS modules** — never in inline styles
7. **Separate static from dynamic** — CSS for tier transitions, inline for responsive flags

**Anti-patterns:**

❌ Hardcoded `600px` in CSS (use semantic tokens instead)
❌ Conditional renders per breakpoint (use CSS display/visibility)  
❌ Scattering breakpoint logic across components
❌ Hover pseudo-classes without touch fallbacks
❌ Duplicate breakpoint definitions

**✓ Correct patterns:**

✓ Media queries organized by ascending breakpoint
✓ Inline styles for multi-flag derived values
✓ Content density awareness in padding/spacing
✓ Touch device hover fallbacks
✓ Semantic device class checks (`isMobile`, `isDesktop`)

### Testing Responsive Layouts

When adding responsive features, test at all 5 breakpoints:

- **375px** (xs/sm boundary)
- **600px** (md: tablet start)
- **900px** (lg: desktop start)
- **1200px** (xl: widescreen start)
- **1800px** (xxl: ultrawide start)

Verify:
- Layout shifts smoothly between tiers
- No content overflow or cutoff
- Touch interactions don't break on coarse pointer
- Text remains readable at extreme sizes
- Spacing maintains visual hierarchy
