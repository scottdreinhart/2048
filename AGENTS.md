# AGENTS.md — Repository Governance Constitution

> **Scope**: Repository-wide. This file is the top-level authority for every AI agent,
> IDE assistant, CLI tool, and CI pipeline operating in this repository.
> All other governance files inherit from and must not contradict this document.

---

## 1. Governance Precedence

1. **AGENTS.md** (this file) — supreme authority; overrides all other governance files.
2. `.github/copilot-instructions.md` — repo-wide Copilot runtime policy.
3. `.github/instructions/*.instructions.md` — scoped, numbered instruction files.
4. `docs/**` — human-readable reference documents (informational, not directive).

If any scoped file contradicts AGENTS.md, AGENTS.md wins.

---

## 2. Absolute Package-Manager Rule

This repository uses **pnpm exclusively**.

| Field | Value |
|---|---|
| `packageManager` | `pnpm@10.31.0` |
| `engines.node` | `24.14.0` |
| `engines.pnpm` | `10.31.0` |

### Mandatory

- Use `pnpm install`, `pnpm add`, `pnpm remove`, `pnpm update`, `pnpm exec`, `pnpm run <script>`.
- Preserve `pnpm-lock.yaml` and `pnpm-workspace.yaml`.

### Forbidden

- Never use `npm`, `npx`, `yarn`, or any non-pnpm package manager.
- Never generate `package-lock.json` or `yarn.lock`.
- Never suggest `npm install`, `npm run`, `npx`, or Yarn workflows.

---

## 3. Architecture Preservation

This project enforces **CLEAN Architecture** with three layers:

| Layer | Path | May Import | Must Not Import |
|---|---|---|---|
| **Domain** | `src/domain/` | `domain/` only | `app/`, `ui/`, React, any framework |
| **App** | `src/app/` | `domain/`, `app/` | `ui/` |
| **UI** | `src/ui/` | `domain/`, `app/`, `ui/` | — |
| **Workers** | `src/workers/` | `domain/` only | `app/`, `ui/`, React |
| **Themes** | `src/themes/` | nothing (pure CSS) | everything |

### Component Hierarchy (Atomic Design)

ui/atoms/ → ui/molecules/ → ui/organisms/

Data flows unidirectionally: **Hooks → Organism → Molecules → Atoms**.

### Import Conventions

- Use path aliases: `@/domain`, `@/app`, `@/ui` (configured in `tsconfig.json` and `vite.config.js`).
- Every directory exposes a barrel `index.ts`. Import from the barrel, not internal files.
- Never introduce `../../` cross-layer relative imports.

---

## 4. Path Discipline

| Path | Purpose |
|---|---|
| `src/domain/` | Pure, framework-agnostic game logic |
| `src/app/` | React hooks, context providers, services |
| `src/ui/atoms/` | Smallest reusable UI primitives |
| `src/ui/molecules/` | Composed atom groups |
| `src/ui/organisms/` | Full feature components |
| `src/themes/` | Lazy-loaded CSS theme files |
| `src/wasm/` | WASM AI loader + fallback |
| `src/workers/` | Web Worker entry points |
| `electron/` | Electron main + preload |
| `assembly/` | AssemblyScript source |
| `scripts/` | Build-time Node scripts |
| `public/` | Static assets (manifest, SW, offline page) |
| `dist/` | Vite build output (gitignored) |
| `release/` | Electron Builder output (gitignored) |
| `docs/` | Human-readable documentation |

Do not invent new top-level directories without explicit user instruction.

---

## 5. Cross-platform shell governance

This repository enforces strict shell usage rules to ensure builds and scripts run in the correct environment and to prevent cross-shell command drift.

### Linux builds and development

Linux builds and general development workflows must use **Bash**.

In this repository, Bash is normally provided through:

- **WSL: Ubuntu** (default on Windows development machines)
- native Linux environments
- CI Linux runners

Use Bash for:

- dependency installation (`pnpm install`)
- development server execution (`pnpm run dev`, `pnpm run start`)
- Vite builds (`pnpm run build`, `pnpm run preview`, `pnpm run build:preview`)
- WASM builds (`pnpm run wasm:build`, `pnpm run wasm:build:debug`)
- linting (`pnpm run lint`, `pnpm run lint:fix`)
- formatting (`pnpm run format`, `pnpm run format:check`)
- typechecking (`pnpm run typecheck`)
- validation (`pnpm run check`, `pnpm run fix`, `pnpm run validate`)
- cleanup (`pnpm run clean`, `pnpm run clean:node`, `pnpm run clean:all`, `pnpm run reinstall`)
- Electron development mode (`pnpm run electron:dev`, `pnpm run electron:preview`)
- Linux Electron packaging (`pnpm run electron:build:linux`)
- Capacitor sync (`pnpm run cap:sync`)
- general source editing, documentation, and repository maintenance

If the task is not explicitly a Windows-native or macOS-native packaging task, use Bash.

### Windows builds

Use **PowerShell** only when the task is explicitly Windows-native Electron packaging:

- `pnpm run electron:build:win`

PowerShell is **not** the default shell.

### macOS and iOS builds

Use a **native or remote macOS** environment only for:

- `pnpm run electron:build:mac`
- `pnpm run cap:init:ios`
- `pnpm run cap:open:ios`
- `pnpm run cap:run:ios`

iOS builds require Apple hardware. Never suggest iOS commands unless macOS availability is confirmed.

### Android builds

Use an **Android-capable environment** (with Android SDK) only for:

- `pnpm run cap:init:android`
- `pnpm run cap:open:android`
- `pnpm run cap:run:android`

### Shell routing summary

| Environment | Tasks |
|---|---|
| **Bash** (WSL / Linux / CI) | All general development, builds, quality checks, WASM, Electron dev, Linux packaging, Capacitor sync |
| **PowerShell** | `electron:build:win` only |
| **macOS** | `electron:build:mac`, iOS Capacitor tasks |
| **Android SDK** | Android Capacitor tasks |

### Hard-stop rules

Never:
- default to PowerShell for routine development
- present PowerShell as interchangeable with Bash for ordinary tasks
- switch to PowerShell unless the task is Windows-native Electron packaging
- claim iOS tasks can run fully from Windows or WSL
- introduce cross-shell command drift

---

## 6. Language, Syntax, and Script Governance

### Approved primary languages

- HTML, CSS, JavaScript, TypeScript, AssemblyScript, WebAssembly

### Language priority order

1. TypeScript  2. JavaScript  3. HTML  4. CSS  5. AssemblyScript  6. WebAssembly

### Rules

- Do not create one-off scripts in random languages.
- Do not create parallel implementations of the same concern.
- New files must live in the correct existing directory.
- Prefer repository-native tooling (Vite, TypeScript, ESLint, Prettier, Electron, Capacitor, AssemblyScript, pnpm).

### Anti-orphan-script policy

Every new script must: solve a real need, belong to approved languages, fit existing structure, not duplicate existing tooling, have clear purpose.

### Hard-stop rules

Never: introduce non-approved languages, create helper scripts in random languages, create duplicate build paths, scatter automation across runtimes.

---

## 7. Minimal-Change Principle

- Modify only what the user requested.
- Do not refactor beyond the scope of the task.
- Do not add dependencies unless explicitly asked.
- Preserve existing code style and organization.

---

## 8. Response Contract

1. **Use pnpm** — never npm, npx, or yarn.
2. **Respect layer boundaries** — per §3.
3. **Use path aliases** — `@/domain/...`, `@/app/...`, `@/ui/...`.
4. **Use existing scripts** — prefer `pnpm <script>` over raw CLI.
5. **Target the correct shell** — per §5.
6. **Cite governance** — explain which rule blocks a request and suggest alternatives.

---

## 9. Self-Check Before Every Response

- [ ] Am I using `pnpm` (not npm/npx/yarn)?
- [ ] Does my import respect layer boundaries in §3?
- [ ] Am I using path aliases, not relative cross-layer imports?
- [ ] Am I targeting the correct shell per §5?
- [ ] Am I using an approved language per §6?
- [ ] Am I avoiding orphaned scripts per §6?
- [ ] Am I modifying only what was requested per §7?
- [ ] Does my output match an existing `package.json` script where applicable?

If any check fails, fix it before responding.

---

## § 10. SOLID Principles & Design Patterns

This codebase enforces **SOLID design principles** and common architectural patterns
to ensure code is extensible, maintainable, and testable.

### S — Single Responsibility Principle

**Each module has one reason to change.**

| Layer | Responsibility |
|---|---|
| **Domain** | Pure game/application logic (types, rules, AI, themes) |
| **App** | React integration (hooks, context, services) |
| **UI** | Presentational components (atoms, molecules, organisms) |
| **Workers** | Isolated background computation (WASM, heavy lifting) |
| **Themes** | Pure CSS theme styling (no imports) |

**Pattern**: `eslint-plugin-boundaries` enforces these boundaries at lint time.

### O — Open/Closed Principle

**Components are open for extension, closed for modification.**

- Extend behavior via **composition** and **custom hooks**, not inheritance.
- New game variants inherit domain logic without modifying base rules.
- Theme system allows new themes without changing component code.

**Patterns in Use**:
- **Composition Pattern**: Atoms compose into molecules; molecules compose into organisms.
- **Higher-Order Components (HOCs)** and **Custom Hooks**: `useTheme()`, `useSoundEffects()`, `useResponsiveState()` encapsulate behavior.
- **Context Providers**: `ThemeContext`, `SoundContext` expose extensible APIs without internal code modification.

### L — Liskov Substitution Principle

**Components and hooks are compatible and interchangeable within their domains.**

- All atoms conform to common prop interfaces (className, style, children).
- All custom hooks return compatible shapes (even if internals differ).
- Fallback patterns ensure compatibility: if WASM fails, JS fallback works identically.

**Example**: `computeAiMove()` (sync) and `computeAiMoveAsync()` (async) have equivalent
contracts—caller doesn't care which is used, both produce valid moves.

### I — Interface Segregation Principle

**Interfaces are fine-grained; components only depend on what they use.**

- Domain layer exposes only necessary types (see `src/domain/types.ts`).
- React hooks expose minimal, focused APIs (e.g., `useResponsiveState()` doesn't include unrelated app state).
- Context providers segregate concerns: `ThemeContext` is separate from `SoundContext`.

**Pattern**: **Barrel Pattern** — Each layer exports a single `index.ts` that re-exports only public APIs.

### D — Dependency Inversion Principle

**High-level modules don't depend on low-level details; both depend on abstractions.**

- Domain layer is framework-agnostic; React depends on domain, not vice versa.
- Custom hooks and context providers are the "abstraction layer" between React and domain.
- Dependency injection via **React Context**: consumers don't construct dependencies, they receive them.

**Pattern**: **Dependency Injection via Hooks**.
```tsx
// Instead of: const theme = new ThemeService()
// Use: const theme = useTheme() // injected via ThemeContext
```

### Architectural Patterns in Use

| Pattern | Where | Purpose |
|---|---|---|
| **CLEAN Architecture** | §3 (layer structure) | Separation of concerns across 5 layers |
| **Atomic Design** | UI hierarchy | atoms → molecules → organisms |
| **Barrel Pattern** | Every directory | `index.ts` re-exports public APIs |
| **Composition Pattern** | Component nesting | Atoms compose into larger components |
| **Custom Hooks Pattern** | `src/app/` | Reusable logic without component duplication |
| **Context Pattern** | `ThemeContext`, `SoundContext` | Shared state without prop drilling |
| **Provider Pattern** | Root `App` tree | Inject dependencies (theme, sound, etc.) |
| **Adapter Pattern** | `useKeyboardControls` → semantic actions | Normalize platform-specific input |
| **Factory Pattern** | Domain AI engines | Create AI instances based on complexity |
| **Strategy Pattern** | `computeAiMove` vs `computeAiMoveAsync` | Switch between sync/async strategies based on needs |

### Agent Checklist

- [ ] Does each module have one reason to change (single responsibility)?
- [ ] Are components extended via composition, not modification?
- [ ] Are fallback implementations compatible with primary implementations (Liskov)?
- [ ] Do interfaces expose only necessary APIs (interface segregation)?
- [ ] Are high-level modules (React components) independent of low-level details (domain)?
- [ ] Are dependencies injected via hooks/context, not constructed directly?
- [ ] Does every directory have a barrel `index.ts`?
- [ ] Are no cross-layer relative imports used (`../../`)?

---

## § 11. Standard Application Shell Architecture

All applications implement a **consistent shell structure** with standard surfaces that appear across projects, ensuring predictable navigation and UX patterns.

### Application Surface Hierarchy

Every application follows a predictable screen sequence:

1. **Splash Screen** — Initial load state, app identity, entry point
2. **Landing/Home Screen** — Primary navigation hub, quick actions, settings access
3. **Main Content Surface** — Core application experience (game board, editor, viewer, etc.)
4. **Results/History Screen** — Data persistence, results viewing, past activity

Not all projects require all surfaces, but when implemented, they follow these patterns.

---

### § 11.1 Splash Screen

**Purpose**: Establish app identity, handle initialization, show loading state.

**Timing & Behavior**:
- Displayed on cold start
- Minimum 500ms, maximum 2s (sufficient for branding, not excessive)
- Dismisses automatically once initialization complete OR via user tap/key press
- Never blocks critical functionality (async initialization only)

**Required Components**:
- App icon or logo (centered, 80–120px)
- App name/title (clear, brand-appropriate)
- Loading indicator (optional, only if initialization > 1s)
- Copyright or version info (optional, footer)

**Responsive Behavior**:
- **Mobile** (xs/sm): Full viewport, vertical layout, large icon
- **Tablet** (md): Centered card, moderate icon
- **Desktop+** (lg/xl/xxl): Centered modal or viewport fill, consistent sizing

**Accessibility**:
- `aria-label="Loading application"`
- High contrast: WCAG AA minimum
- Not keyboard-interactive (auto-dismisses)

---

### § 11.2 Landing/Home Screen

**Purpose**: Primary navigation hub, quick access to main features, settings/info access.

**Required Components**:
- **Primary Action Button(s)**: "New", "Continue", "Start", "Open", etc. (context-specific)
- **Settings Button**: Accessible from landing, leads to full-screen settings modal
- **Optional Secondary Links**: Help, about, credits, history, stats
- **App Title/Branding**: Reinforces identity (can be shared with splash if splash → home is instant)

**Layout Strategy**:
- **Mobile** (xs/sm): Single-column, large touch targets (≥44px min), full-height
  - Title at top
  - Primary actions stacked vertically, prominent spacing
  - Settings + secondary links at bottom
- **Tablet** (md): Two-column or centered layout, balanced spacing
  - Title/branding left or top
  - Actions center, secondary nav right or bottom
- **Desktop+** (lg/xl/xxl): Card-based or grid layout, generous whitespace
  - Actions positioned naturally (top-right, center, left sidebar)
  - Secondary links styled as smaller buttons or text links
  - Settings accessible via button or menu icon

**Navigation Patterns**:
- Home screen should be reachable from main content (back button, home icon, menu)
- Settings should open in full-screen modal (not navigate away)
- Primary action should launch main experience
- All actions mapped to semantic input (confirm, openSettings)

**Responsive Behavior**:
- Adapt button size per `responsive.contentDensity` (compact → smaller, spacious → larger)
- Viewport height awareness: on short screens (mobile landscape), compress vertical spacing
- Touch optimization: larger targets on mobile, fine-pointer details on desktop

---

### § 11.3 Main Content Surface

**Purpose**: Core application experience—game board, editor canvas, viewer pane, etc.

**Structure**:
- **Primary Canvas**: Central focus area (game board, content editor, data viewer)
- **Status Overlay** (optional): Session information (score, timer, status, current player)
- **In-App Controls** (optional): Context-specific buttons or indicators (pause, settings, quit)
- **Hamburger Menu** (optional): Quick access to pause, settings, quit during active session

**Status Information** (when applicable; not all projects need all):
- Score or progress indicator
- Timer or counter
- Status text (current phase, instructions, metadata)
- Lives/attempts remaining
- Difficulty or mode indicator
- Pause button or settings menu toggle

**Responsive Behavior**:
- **Mobile**: Status compressed to minimal info, positioned edges/overlay
  - Score top-left or top-right
  - Buttons bottom corners or hamburger menu (top-right)
  - Timer/status inline with score or below canvas
- **Desktop+**: Status more spacious, positioned periphery
  - Sidebar with all info, or top overlay
  - Status bar layout: icon + text pairs, ample padding
  - Larger text hierarchy, clear visual separation

**Content Density Awareness**:
- Compact mode: Minimal information, essentials only
- Comfortable (default): Standard info display
- Spacious mode: Extended information, larger text, extra padding

**Touch Optimization**:
- Control buttons ≥44px touch target
- Disable hover animations on mobile (use `@media (pointer: coarse)`)
- Text readable without hover tooltips

---

### § 11.4 Full-Screen Settings Modal

**Purpose**: Comprehensive, transactional settings configuration.

**Required Behavior**:
- Launched from landing screen or in-app menu (not in-content side panel)
- Full modal overlay, blocks underlying content
- Organized into logical sections (display, accessibility, etc.)
- Confirm (OK) and Cancel buttons (Cancel reverts all changes)

**Sections** (adapt per project):
- **Application Settings** (if applicable): Behavior options, defaults, preferences
- **Display/Theme**: Theme/color scheme, animation toggles, contrast settings
- **Accessibility**: Text size, high contrast, reduced motion, colorblind modes
- **Audio**: Master volume, sound effects, music toggles
- **Advanced** (optional): Debug options, data export, cache clearing

**Responsive Behavior**:
- **Mobile** (xs/sm): Full-screen, scrollable if content exceeds viewport
  - Section headers as collapsible tabs or stacked accordion
  - Buttons stacked at bottom (OK / Cancel full-width)
- **Tablet+** (md+): Modal card or full-screen with centered content
  - Sections in left sidebar or top tabs
  - Buttons bottom-right or centered footer
  - Max-width constraint (≤600px on tablet, ≤800px on desktop)

**Form & Accessibility**:
- All toggles, selects, inputs properly labeled
- WCAG AA contrast minimum
- Keyboard navigable (Tab through sections, Enter/Space to toggle)
- Optional: Read-only summary of changes before OK confirmation

---

### § 11.5 Results/History Screen

**Purpose**: View past sessions, data records, activity history.

**Use Cases**:
- View past sessions with results/scores, timestamps, duration
- File/document history, previews
- Statistics, logs, execution history

**Required Components**:
- **List or Table**: Past results, sortable/filterable if substantial volume
  - Timestamp, result/score, duration, metadata
- **Row Details**: Tap/click to expand for session details
- **Navigation**: Back to landing, clear history (optional + confirmation)
- **Summary Stats** (optional): Total sessions, best result, average, trends

**Responsive Behavior**:
- **Mobile** (xs/sm): List view, one item per row
  - Compact per-row layout: score + timestamp, tap to expand details
  - Details panel slides in or modal overlay
- **Desktop+** (md+): Table view or card grid
  - Multiple columns: timestamp, result, duration, metadata, actions
  - Hover to show action buttons (or buttons always visible in spacious mode)
  - Sortable columns (click header to sort)

**Content Density**:
- **Compact**: Result + timestamp only, minimal spacing
- **Comfortable** (default): Result + timestamp + metadata, standard spacing
- **Spacious**: Extended columns, generous padding, details always visible

**Access & Navigation**:
- Reachable from landing screen (secondary link)
- Reachable from main content surface (via menu)
- Never opened automatically during active session
- Destructive actions require confirmation

---

### § 11.6 Common Shell Patterns

**Navigation Consistency**:
- Landing/Home screen always accessible (home icon, menu, back from any screen)
- Settings always accessible (from landing, main content menu, or modal)
- Primary action always prominent on landing screen

**Input Mappings Across Surfaces**:
- `Escape` or `Back` button: Return to home from any screen
- `Tab`: Cycle focus through controls (keyboard navigation)
- `Enter`/`Space`: Confirm action (OK button, primary action)
- Context-specific mappings documented per surface

**Modal Hierarchy**:
- **Settings Modal** (full-screen, transactional): OK/Cancel, changes batched
- **Confirmation Dialog** (centered modal): Yes/No for destructive actions
- **Info Dialog** (centered modal): OK only, informational alerts

**Responsive Principles**:
All shell surfaces adapt across 5 device tiers (mobile/tablet/desktop/widescreen/ultrawide):
- Button sizing scales with `responsive.contentDensity`
- Text hierarchy maintained across all tiers
- Touch targets ≥44px on mobile
- Spacing and layout adapt per `responsive.isDesktop` / `responsive.isMobile` / etc.

---

### § 11.7 Shell Surface Checklist

- [ ] Splash screen: Timed display (500ms–2s), auto-dismiss or interactive, centered logo/title
- [ ] Landing screen: Primary action button(s), settings button, back-to-home accessible
- [ ] Main content surface: Status display positioned responsively, optional menu/controls
- [ ] Settings modal: Organized sections, OK/Cancel buttons, transactional semantics
- [ ] Results/history screen: List/table, sortable, return-to-landing navigation
- [ ] All surfaces: Responsive across 5 device tiers (mobile/tablet/desktop/widescreen/ultrawide)
- [ ] All surfaces: Content density awareness (padding/font-size scale with `contentDensity`)
- [ ] All surfaces: Touch optimization (≥44px targets, no hover-only interactions on mobile)
- [ ] All surfaces: Keyboard navigation (Tab, Escape, Enter work as expected)
- [ ] All surfaces: WCAG AA contrast minimum achieved
- [ ] Navigation consistent: Home always reachable, Settings always accessible
- [ ] Input mappings documented: Actions per surface (main vs menu vs modal)

---

## § 12. Responsive Design & Device-Aware UI Governance

All UI components **must** support responsive layouts across 5 semantic device tiers.
This ensures consistent, optimal UX on **mobile (375px)**, **tablet (600px)**, **desktop (900px)**, **widescreen (1200px)**, and **ultrawide (1800px)** screens.

### Single Source of Truth

**Responsive state is centralized.** Components consume `useResponsiveState()` from `@/app` — never raw `matchMedia()`, `window.innerWidth`, or ad-hoc breakpoint logic.

```tsx
const responsive = useResponsiveState()
// Access: isMobile, isTablet, isDesktop, contentDensity, interactionMode, etc.
```

### 5-Tier Semantic Architecture (Mandatory)

| Tier | Range | Device Class | Layout Strategy | Content Density |
|---|---|---|---|---|
| **Mobile** | xs/sm: <600px | Phones | Single-column, touch-optimized | compact |
| **Tablet** | md: 600–899px | Tablets, large phones | Multi-column with spacing | comfortable |
| **Desktop** | lg: 900–1199px | Laptops, monitors | Full-featured layouts | comfortable |
| **Widescreen** | xl: 1200–1799px | Large monitors | Extra spacing, generous UI | spacious |
| **Ultrawide** | xxl: 1800px+ | Curved/multi-monitor | Maximum refinement | spacious |

All components must be explicitly designed for **all 5 tiers**. No single-tier assumptions.

### Component-Level Implementation Pattern (Mandatory)

**Use combined approach: CSS Media Queries + Inline Responsive Styles**

1. **CSS Media Queries** (`*.module.css`) — Static variants per tier:
   - Typography sizes (font-size, line-height)
   - Padding/margin increments
   - Border radius, shadows
   - Touch device hover fallbacks

2. **Inline Styles** (React `style` prop) — Dynamic values derived from multiple state flags:
   - Layout direction (flex-direction, grid columns)
   - Content density awareness
   - Max-width clamping
   - Interaction mode optimization

```tsx
const responsive = useResponsiveState()

<div
  className={styles.container}  // CSS breakpoint variants
  style={{
    // Inline responsive values
    flexDirection: responsive.isDesktop ? 'row' : 'column',
    padding: responsive.contentDensity === 'compact' ? '1rem' : '1.5rem',
    maxWidth: responsive.isMobile ? '90vw' : '700px',
  }}
>
```

### CSS Module Breakpoint Organization (Mandatory)

**Organize media queries in ascending order with explicit range comments:**

```css
/* Base: all devices */
.button { padding: 1rem; }

/* Mobile: <600px */
@media (max-width: 599px) {
  .button { padding: 0.75rem; }
}

/* Tablet: 600–899px */
@media (min-width: 600px) and (max-width: 899px) {
  .button { padding: 0.9rem; }
}

/* Desktop: 900–1199px */
@media (min-width: 900px) {
  .button { padding: 1.2rem; }
}

/* Ultrawide: 1800px+ */
@media (min-width: 1800px) {
  .button { padding: 1.4rem; }
}
```

### Content Density Awareness (Mandatory)

Apply `responsive.contentDensity` ('compact' | 'comfortable' | 'spacious') to all spacing decisions:

```tsx
style={{
  padding: responsive.contentDensity === 'compact' ? '0.75rem' : '1rem',
  gap: responsive.contentDensity === 'spacious' ? '2rem' : '1.5rem',
  fontSize: responsive.contentDensity === 'compact' ? '0.9rem' : '1rem',
}}
```

**Why**: Ensures optimal density per device tier and user ability.

### Touch Device Optimization (Mandatory)

**All interactive elements must handle coarse pointer (touch) devices.**

Never use `:hover` without a fallback:

```css
/* Normal pointer interaction */
.button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Touch device fallback — disable hover animations */
@media (pointer: coarse) {
  .button:hover {
    background: transparent;
    transform: none;
  }
}
```

**Guardrail**: If you add a `:hover` pseudo-class, add a corresponding `@media (pointer: coarse)` rule.

### Device Category Checks (Recommended)

Use semantic device flags for layout decisions:

- `responsive.isMobile` — width < 600px (phones, small tablets)
- `responsive.isTablet` — 600px ≤ width < 900px (tablets, large phones)
- `responsive.isDesktop` — width ≥ 900px (laptops, desktops)

Prefer these over raw breakpoint flags (`isXs`, `isSm`, etc.) for layout logic.

### Related Directives

- Complete CSS and component patterns: `.github/instructions/06-responsive.instructions.md`
- Responsive state types & breakpoints: `src/domain/responsive.ts`
- Hook reference: `src/app/useResponsiveState.ts`

### Agent Checklist

- [ ] Component uses `useResponsiveState()` hook (not raw `matchMedia`)?
- [ ] All 5 device tiers covered in CSS media queries?
- [ ] Dynamic values use inline styles with `responsive.` flags?
- [ ] Static variants in media queries organized by ascending breakpoint?
- [ ] Content density applied to padding/gap/font-size decisions?
- [ ] Touch device `:hover` fallbacks present (`@media (pointer: coarse)`)?
- [ ] No hardcoded breakpoint pixels in component (uses domain tokens)?
- [ ] Tested at all 5 breakpoints: 375px, 600px, 900px, 1200px, 1800px?

---

## § 13. Menu & Settings Architecture Governance

All applications implement a **dual-menu system** that separates in-app/in-game quick settings from comprehensive full-screen configuration.

### Architecture Mandate

**Two distinct menu layers:**

1. **Hamburger Menu** (quick access, non-blocking)
   - Portal-rendered dropdown (fixed positioning above content)
   - Quick settings: difficulty, sound, theme, colorblind mode
   - Accessible while active
   - Keyboard navigation: ESC to close, focus management, tab trapping
   - Touch optimized: click-outside detection, no accidental triggers
   - Animated hamburger icon: 3-line → X transformation
   - Z-index: 9999+ to layer above game elements

2. **Full-Screen Settings Modal** (comprehensive, from home screen)
   - Organized sections: application settings, theme/display, accessibility
   - All context providers integrated (ThemeContext, SoundContext, etc.)
   - OK/Cancel buttons with transactional semantics
   - Scrollable on mobile if needed
   - Accessible form fields with proper labeling

### Hamburger Menu Component Requirements

**Portal Rendering:**
```tsx
const HamburgerMenu: React.FC<Props> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [panelPos, setPanelPos] = useState<Position | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Portal to document.body for layering
  return (
    <div className={styles.root}>
      <button
        ref={btnRef}
        type="button"
        className={styles.button}
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="menu-panel"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {/* Hamburger icon */}
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          id="menu-panel"
          className={styles.panel}
          role="menu"
          aria-label="Settings"
          style={panelPos}
        >
          {children}
        </div>,
        document.body,
      )}
    </div>
  )
}
```

**Positioning Logic:**
- Use `useLayoutEffect` to calculate panel position from button bounding rect
- Align panel right-edge to content board right-edge (with overflow clamping)
- Position below button with 8px vertical spacing
- Prevent overflow left of boundary

**Dropdown Behavior Hook** (`useDropdownBehavior`):
- Close on ESC key press
- Close on outside click (except trigger button and panel)
- Restore focus to trigger button on close
- Tab trap: keep focus within menu while open
- `mousedown` + `touchstart` listeners for touch support

**Icon Animation:**
- 3 horizontal lines (hamburger) → X shape (spring cubic-bezier)
- Line 1: `translateY(6.5px) rotate(45deg)`
- Line 2: fade out (`opacity: 0`)
- Line 3: `translateY(-6.5px) rotate(-45deg)`
- Transition duration: 300ms ease

**Accessibility Requirements:**
```tsx
ariaHaspopup="true"           // Button opens menu
ariaExpanded={open}             // Indicates open state
ariaControls="menu-panel"       // Connects to panel
ariaLabel={"Open/Close menu"}   // Descriptive label
role="menu"                     // Panel semantic role
ariaLabel="Settings"            // Panel purpose
```

**Responsive Sizing:**
- Mobile: `min-width: 240px`, `max-width: 320px`
- Tablet: `min-width: 280px`, `max-width: 400px`
- Desktop: `min-width: 320px`, `max-width: 480px`
- Ultrawide: `min-width: 380px`, `max-width: 520px`
- Content density aware: padding/gap scale with `contentDensity` enum

### Settings Panel Integration Mandate

**Full-Screen Modal for Comprehensive Configuration:**
- Triggered from home screen (MainMenu, not during active session)
- Organized into logical sections (application settings, display, accessibility)
- All context setters integrated (updateDifficulty, setTheme, toggleSound, etc.)
- Reuses button/toggle atoms from hamburger menu for consistency
- Confirms changes via OK button (transactional)
- Cancels reverts changes via Cancel button
- Scrollable on mobile if content exceeds viewport height

### Agent Checklist

- [ ] Hamburger button uses `createPortal()` to document.body?
- [ ] Menu panel is z-index: 9999+ (above content layer)?
- [ ] Position calculated via `useLayoutEffect` from button bounding rect?
- [ ] `useDropdownBehavior` hook handles ESC key and outside click?
- [ ] Icon animates: 3-line → X (spring cubic-bezier, 300ms)?
- [ ] Accessibility attributes present: aria-haspopup, aria-expanded, aria-controls, aria-label?
- [ ] Focus management: moves to menu on open, returns on close?
- [ ] Touch-safe: no accidental content triggers while menu open?
- [ ] Responsive sizing applied: mobile (240–320px) → desktop (320–480px) → ultrawide (380–520px)?
- [ ] Content density awareness: padding/gap scale with contentDensity enum?
- [ ] Settings modal is separate full-screen component (not in-app)?
- [ ] Modal sections organized: application / display / accessibility?
- [ ] All context setters integrated (theme, sound, difficulty, etc.)?

---

## Input Controls Directive (Mandatory)

- The full cross-platform input architecture directive is defined in `.github/instructions/08-input-controls.instructions.md`.
- All agent-authored input changes MUST comply with that directive, including semantic action modeling, context-aware behavior, text-input safety, repeat/phase handling, and TV-first focus requirements.
- In conflicts between implementation convenience and directive compliance, directive compliance wins.
- `useKeyboardControls` MUST remain a keyboard adapter (not a monolithic input system); broader orchestration belongs in higher-level app hooks.

### Agent Checklist

- [ ] Input mappings dispatch semantic actions, not raw device events in UI/game logic.
- [ ] Keyboard mappings prefer `event.code` for game controls (WASD, arrows, space, enter).
- [ ] Text-entry safety is preserved (no accidental gameplay triggers while typing).
- [ ] Context-sensitive behavior is explicit (gameplay/menu/chat/modal/disabled).
- [ ] Repeat and key phase (`keydown`/`keyup`) behavior is intentional per action.
- [ ] TV baseline navigation works with D-pad + OK + Back semantics.

---

## § 14. Electron & Desktop Build Governance

Electron wraps the Vite web app in a native desktop window.

### Scripts & Shell Routing

| Script | Purpose | Shell |
|---|---|---|
| `pnpm electron:dev` | Vite dev + Electron (via concurrently + wait-on) | **Bash (WSL: Ubuntu)** |
| `pnpm electron:preview` | Vite build + Electron on dist/ | **Bash (WSL: Ubuntu)** |
| `pnpm electron:build` | Vite build + electron-builder for current OS | Platform-dependent |
| `pnpm electron:build:win` | Windows portable `.exe` → `release/` | **PowerShell only** |
| `pnpm electron:build:linux` | Linux `.AppImage` → `release/` | **Bash (WSL: Ubuntu)** |
| `pnpm electron:build:mac` | macOS `.dmg` → `release/` | **macOS / Apple only** |

### Electron Architecture

- **Main process**: `electron/main.js` — native window lifecycle and menu
- **Preload script**: `electron/preload.js` — sandboxed context bridge
- **Dev mode**: Connects to Vite dev server at `localhost:5173`
- **Production**: Loads built `dist/` files directly

### Platform Targets & Configuration

**Electron Builder Config** (in `package.json` `"build"` key):
- `appId`: `com.scottreinhart.<projectname>`
- `productName`: `<ProjectName>`
- `directories.output`: `release/`
- `files`: `dist/**/*`, `electron/**/*`

| Target | Output | Notes |
|---|---|---|
| Windows | `.exe` (portable, unsigned) | Run via PowerShell only |
| macOS | `.dmg` (disk image) | Requires macOS hardware |
| Linux | `.AppImage` (self-contained) | Run via Bash |

### Key Dependencies

`electron` (40.8.0), `electron-builder` (26.8.1), `concurrently` (~9.x), `wait-on` (~8.x)

---

## § 15. Capacitor & Mobile Build Governance

Capacitor wraps Vite `dist/` output in native Android and iOS WebView shells.

### Scripts & Environment Routing

| Script | Purpose | Required Environment |
|---|---|---|
| `pnpm cap:sync` | Vite build + sync web assets to native | Bash (WSL: Ubuntu) |
| `pnpm cap:init:android` | Add Android project (one-time) | Any |
| `pnpm cap:init:ios` | Add iOS project (one-time) | **macOS / Apple only** |
| `pnpm cap:open:android` | Open Android Studio | Any (requires Android Studio) |
| `pnpm cap:open:ios` | Open Xcode | **macOS / Apple only** |
| `pnpm cap:run:android` | Deploy to Android device/emulator | Any (requires Android SDK) |
| `pnpm cap:run:ios` | Deploy to iOS device/simulator | **macOS / Apple only** |

**Critical**: Never suggest iOS commands unless macOS availability is confirmed. iOS requires Apple hardware.

### Configuration

`capacitor.config.ts` in project root defines app metadata, platform-specific settings, and plugin configuration.

### Workflow

1. Build web app: `pnpm build`
2. Sync to native: `pnpm cap:sync`
3. Open IDE: `pnpm cap:open:android` or `pnpm cap:open:ios`
4. Build & deploy from native IDE

### Platform Support

| Platform | Distribution | Input Method |
|---|---|---|
| Android phones | Google Play / `.apk` | Touch, swipe |
| Android tablets | Google Play | Touch, swipe |
| iPad | App Store | Touch, swipe |
| iPhone | App Store | Touch, swipe |

### Key Dependencies

`@capacitor/core` (8.2.0), `@capacitor/android` (8.2.0), `@capacitor/cli` (8.2.0)

---

## § 16. WASM & AI Engine Governance

AssemblyScript source compiles to WebAssembly, embedded as base64 and loaded in a Web Worker for CPU move computation.

### Architecture

| Path | Purpose |
|---|---|
| `assembly/index.ts` | AssemblyScript source — AI engine |
| `assembly/tsconfig.json` | AssemblyScript compiler config |
| `scripts/build-wasm.js` | Build script: AS → WASM → base64 → `src/wasm/ai-wasm.ts` |
| `src/wasm/ai-wasm.ts` | Auto-generated base64 WASM (do not edit manually) |
| `src/workers/ai.worker.ts` | Web Worker — WASM-first with JS fallback |
| `build/ai.wasm` | Intermediate binary (gitignored) |

### Data Flow

```
assembly/index.ts 
  ↓ (pnpm wasm:build)
build/ai.wasm 
  ↓ (base64 encode)
src/wasm/ai-wasm.ts 
  ↓ (import in worker)
src/workers/ai.worker.ts 
  ↓ (postMessage/onmessage)
UI organism
```

### Scripts

| Script | What | Shell |
|---|---|---|
| `pnpm wasm:build` | Production WASM (optimized) | Bash (WSL: Ubuntu) |
| `pnpm wasm:build:debug` | Debug WASM (source maps) | Bash (WSL: Ubuntu) |

### Language Boundaries

- **AssemblyScript**: WASM source code only (`assembly/`)
- **JavaScript**: Build script (`scripts/build-wasm.js`)
- **TypeScript**: Runtime loader (`src/wasm/ai-wasm.ts`), worker (`src/workers/ai.worker.ts`)

**Anti-orphan-script policy**: Single build path only (`pnpm wasm:build` → `scripts/build-wasm.js`). Do not create alternative build pipelines. Never edit `src/wasm/ai-wasm.ts` manually.

### Worker Strategy

Web Worker follows WASM-first pattern:
1. Decode base64 → compile → instantiate WASM on worker startup
2. If WASM available: use for all move computations
3. If WASM fails: fall back to JS AI (`src/domain/ai.ts`)

**Import rules**: Workers import only from `@/domain` (per §3); `@/wasm` permitted (data-only base64 string).

### Key Dependencies

`assemblyscript` (0.28.10)

---

## § 17. Responsive Design & Mobile-First Patterns

All components must support 5 semantic device tiers via `useResponsiveState()`.

### Entry Point (Mandatory)

Components consume `useResponsiveState()` — never raw `matchMedia()`, `window.innerWidth`, or ad-hoc checks.

```tsx
const { isMobile, isDesktop, contentDensity, supportsHover } = useResponsiveState()
```

### Breakpoint Tokens (from src/domain/responsive.ts)

| Token | Width (px) | Device Class |
|---|---|---|
| xs | 0 | Small phone |
| sm | 375 | Phone |
| md | 600 | Tablet / mobile boundary |
| lg | 900 | Desktop boundary |
| xl | 1200 | Wide desktop |
| xxl | 1800 | Ultrawide |

Height thresholds: `short` (500px), `medium` (700px).

### ResponsiveState Fields

**Breakpoint flags** (mutually exclusive): `isXs`, `isSm`, `isMd`, `isLg`, `isXl`, `isXxl`

**Device categories** (mutually exclusive): `isMobile` (<md), `isTablet` (md–lg), `isDesktop` (≥lg)

**Composite flags**: `compactViewport`, `shortViewport`, `wideViewport`, `ultrawideViewport`, `touchOptimized`, `denseLayoutAllowed`, `fullscreenDialogPreferred`

**Layout modes**: `navMode` (bottom-tabs/drawer/sidebar), `contentDensity` (compact/comfortable/spacious), `dialogMode` (fullscreen/bottom-sheet/centered-modal), `interactionMode` (touch/hybrid/pointer-precise), `gridColumns` (1–4)

**Raw capabilities**: `width`, `height`, `isPortrait`, `isLandscape`, `supportsHover`, `hasCoarsePointer`, `hasFinePointer`, `prefersReducedMotion`

### Component-Level Implementation Pattern

**Combined approach: CSS Media Queries + Inline Responsive Styles**

**CSS Media Queries** (static variants per tier in `*.module.css`):
```css
.button { padding: 1rem; }  /* Base */

@media (max-width: 599px) {
  .button { padding: 0.75rem; }  /* Mobile */
}

@media (min-width: 900px) {
  .button { padding: 1.2rem; }  /* Desktop */
}

@media (pointer: coarse) {
  .button:hover { transform: none; }  /* Touch fallback */
}
```

**Inline Styles** (dynamic values via `useResponsiveState()`):
```tsx
style={{
  padding: responsive.contentDensity === 'compact' ? '0.75rem' : '1rem',
  flexDirection: responsive.isDesktop ? 'row' : 'column',
  maxWidth: responsive.isMobile ? '90vw' : '700px',
}}
```

**Rule**: If you add `:hover`, add `@media (pointer: coarse)` fallback for touch devices.

### Content Density Awareness (Mandatory)

Apply `contentDensity` enum to all spacing decisions:

```tsx
style={{
  padding: responsive.contentDensity === 'compact' ? '0.75rem' : '1rem',
  gap: responsive.contentDensity === 'spacious' ? '2rem' : '1.5rem',
}}
```

### SSR Safety

Hooks guard with `typeof window !== 'undefined'`. Defaults: `false` for queries, `{ width: 0, height: 0 }` for dimensions.

---

## § 18. Scale-Aware AI Orchestration (Mandatory)

All game projects implement scale-aware AI computation that chooses the simplest execution model that does not block the UI.

### Three-Tier Decision Tree

```
┌─ Estimate board complexity
│
├─ SIMPLE (<10ms decision time)
│  └─ Sync main-thread WASM
│     Fallback: JS (always available)
│
├─ MEDIUM (10–100ms decision time)
│  └─ Optional async via Web Worker
│     Fallback: Sync main-thread (always correct)
│
└─ COMPLEX (>100ms decision time)
   └─ Required async (UI blocking unacceptable)
      Fallback: Simplified heuristic (quality trade-off)
```

### Required Implementation Files

**`src/app/aiEngine.ts` (or equivalent)**
```typescript
// SYNC PATH (main-thread, WASM-accelerated)
export const computeAiMove = (
  board: Board,
  difficulty: Difficulty,
  ...
): AiResult

// ASYNC PATH (worker-backed, optional)
export const computeAiMoveAsync = async (
  board: Board,
  difficulty: Difficulty,
  ...
): Promise<AiResult>

// LIFECYCLE
export const ensureWasmReady = (): Promise<void>
export const terminateAsyncAi = (): void
```

**`src/workers/ai.worker.ts`**
- Receives: `{ board, difficulty, ... }`
- Loads WASM on startup
- Sends back: `{ index, engine }`
- Has JS fallback for all difficulties

**`src/app/useCpuPlayer.ts` or game orchestration hook**
- Decision: Should async be used?
- Dispatches to sync or async based on complexity

### Performance Guardrails

| Path | Target | Examples |
|---|---|---|
| Sync | <100ms | 3×3 tic-tac-toe, 4×4 lights-out |
| Async | <500ms | 5×5 chess, 8×8 checkers, complex puzzles |

**Benchmark rule**: If decision time > 10ms, profile to determine if async helps.

### Testing Requirements

All AI implementations must validate:
- ✅ Sync path: all difficulties, all board states
- ✅ Async path: worker lifecycle, concurrent requests
- ✅ Equivalence: sync and async produce same move
- ✅ Performance: sync <100ms, async <500ms
- ✅ Fallback: both handle errors gracefully

---

## § 19. Input Controls & Action-Based Architecture (Mandatory)

Input is implemented as an action-based abstraction layer, not ad-hoc device-specific event handling.

### Semantic Action Model (Mandatory)

All device input maps to semantic actions, which are the single source of truth:

**Movement**: moveUp, moveDown, moveLeft, moveRight  
**Confirmation**: confirm, cancel, primaryAction, secondaryAction  
**Navigation**: nextTab, prevTab, openMenu, closeMenu  
**Game**: pause, interact, openChat, sendChat, cancelChat  

**Rule**: Game logic, UI logic, and navigation respond to actions, not raw keyboard keys or buttons.

### Architecture Rules

1. **Canonical action registry** — single source of truth (not hardcoded in game logic)
2. **Hook responsibility** — `useKeyboardControls` is a keyboard adapter only; broader orchestration in higher-level hooks like `useInputControls` or `useActionControls`
3. **Context-aware behavior** — separate contexts: gameplay, menu, chat, modal, disabled
4. **Text-input safety** — text entry must not trigger gameplay accidentally

### Platform-Specific Requirements

#### Desktop (Keyboard-First)

**Movement**: WASD, Arrow keys → moveUp/Down/Left/Right  
**Confirm**: Enter, Space → confirm/primaryAction  
**Cancel**: Escape → cancel/pause  
**Interaction**: E (interact), F (secondary), R (reset), Tab (cycle), T (toggle)  

**Implementation**: Use `event.code` for physical bindings (KeyW, KeyA, KeyS, KeyD, ArrowUp, etc.). Avoid hijacking text editing while text input is focused.

#### Web (Desktop + Accessibility)

Same as Desktop, but:
- Respect browser conventions (Tab, Escape, etc.)
- Preserve focus management for accessibility
- Do not override browser shortcuts without clear ownership
- Maintain standard web interaction patterns in forms and dialogs

#### Mobile (Touch-First, Not Keyboard Metaphor)

**Primary patterns**: tap, long press, swipe, drag (only where ergonomically natural)  
**Philosophy**: Fewer controls are better than cluttered screens  
**Do not**: Overload with virtual buttons; use keyboard metaphors; assume WASD

#### TV (D-Pad + OK + Back)

**Navigation**: D-Pad (up/down/left/right)  
**Confirm**: OK button  
**Cancel**: Back button  
**Focus trap**: Focus management mandatory; never allow focus to escape  

### Text-Input Safety (Critical)

When user is in text-entry context (chat, forms, input fields):
- Gameplay input must not fire
- Standard text editing must be preserved (Ctrl+C, Ctrl+V, etc.)
- Escape should close/cancel text input, not trigger game pause
- Enter should submit text, not trigger game action

### Implementation Constraints

- Use `event.code` for game-style physical bindings
- Use `event.key` only when semantic meaning matters
- Platform adapters (Desktop, Web, Mobile, TV) map physical input → semantic actions
- No direct per-component `document.addEventListener`; use centralized hooks
- All context switching explicit and well-documented

---

## § 20. Build & Deployment Governance

All projects enforce consistent build, testing, and deployment workflows via `package.json` scripts.

### Script Routing Matrix

| Script | What It Does | Shell |
|---|---|---|
| `pnpm build` | Vite production build → `dist/` | Bash (WSL: Ubuntu) |
| `pnpm build:preview` | Build + local preview server | Bash (WSL: Ubuntu) |
| `pnpm electron:build` | Vite build + electron-builder for current platform → `release/` | Platform-dependent (see below) |
| `pnpm electron:build:win` | Windows `.exe` (portable) → `release/` | **PowerShell** |
| `pnpm electron:build:linux` | Linux `.AppImage` → `release/` | Bash (WSL: Ubuntu) |
| `pnpm electron:build:mac` | macOS `.dmg` → `release/` | **macOS / Apple** |
| `pnpm cap:sync` | Vite build + Capacitor sync to native projects | Bash (WSL: Ubuntu) |
| `pnpm wasm:build` | AssemblyScript → WASM → base64 | Bash (WSL: Ubuntu) |
| `pnpm wasm:build:debug` | WASM debug build | Bash (WSL: Ubuntu) |

### Output Directories

| Directory | Contents | Gitignored |
|---|---|---|
| `dist/` | Vite production build output | Yes |
| `release/` | Electron Builder distributables | Yes |
| `node_modules/` | Dependencies | Yes |

### Cleanup Scripts

| Script | Effect |
|---|---|
| `pnpm clean` | Removes `dist/` and `release/` |
| `pnpm clean:node` | Removes `node_modules/` |
| `pnpm clean:all` | Removes `dist/`, `release/`, and `node_modules/` |
| `pnpm reinstall` | `clean:all` + `pnpm install` |

### Quality Gate Scripts

| Script | Effect |
|---|---|
| `pnpm lint` | ESLint check on `src/` |
| `pnpm lint:fix` | ESLint auto-fix on `src/` |
| `pnpm format` | Prettier format `src/` |
| `pnpm format:check` | Prettier check `src/` (no write) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm check` | `lint` + `format:check` + `typecheck` |
| `pnpm fix` | `lint:fix` + `format` |
| `pnpm validate` | `check` + `build` (full pre-push gate) |

Always run `pnpm validate` before pushing changes.

### Language Guardrails

Build scripts use **JavaScript** (Node) in `scripts/`. Do not introduce Python, Bash, PowerShell, or other side-language build helpers.  
Prefer existing `package.json` scripts over raw CLI commands.  
Do not create parallel build paths or duplicate tooling.
