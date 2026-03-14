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

### 4.1 Barrel Pattern & Public API (Mandatory)

**Every directory exposes a barrel `index.ts` that re-exports public APIs.**

**Rule**: Import from barrels, never internal files.

```ts
// ❌ BAD: Importing from internal file
import { useTheme } from '@/app/useTheme'

// ✅ GOOD: Importing from barrel
import { useTheme } from '@/app'
```

**Barrel Organization by Layer:**

| Layer | Public API | Private (Not Exported) |
|-------|-----------|----------------------|
| **domain** | Types, rules, AI logic, constants | Internal helpers, memoization, caches |
| **app** | Hooks (useTheme, useState), context providers, services | Hook internals, internal state machines, _validate functions |
| **ui/atoms** | All component exports | Internal style logic, constants (use CSS variables instead) |
| **ui/molecules** | Composite components, hooks | Atom usage patterns, internal layout logic |
| **ui/organisms** | Feature components, custom hooks | Atom/molecule assembly details, hooks per component |
| **wasm** | Loader function, type stubs | Base64 string (import it, don't use directly) |
| **workers** | Worker factory/manager | Worker internals, message types (export from domain) |

**Implementation Pattern:**
```ts
// src/app/index.ts (barrel — single source of truth)
export { useTheme } from './useTheme'
export { useSoundEffects } from './useSoundEffects'
export { useResponsiveState } from './useResponsiveState'
export { ThemeContext, ThemeProvider } from './ThemeContext'
export type { State, AppConfig } from './types'

// Do NOT export:
// export { _validateTheme }  ← internal
// export { THEME_CACHE }     ← internal state
// export { loadWasm }        ← internal loader (exported from @/wasm)
```

### 4.2 File Naming Conventions (Mandatory)

**Consistent naming ensures predictable imports and reduces cognitive load.**

| Pattern | Use Case | Examples |
|---------|----------|----------|
| `use*.ts` | Custom React hooks | `useTheme.ts`, `useSoundEffects.ts`, `useResponsiveState.ts`, `useGame.ts` |
| `*Context.tsx` | React Context providers | `ThemeContext.tsx`, `SoundContext.tsx` |
| `*Service.ts` | Stateless utility/service | `storageService.ts`, `analyticsService.ts`, `crashLogger.ts` |
| `*.types.ts` | Type definitions only | `types.ts` (layer-level), `domain.types.ts` (cross-reference) |
| `index.ts` | Barrel export (mandatory) | Every subdirectory needs one |
| `index.module.css` | Scoped styles | Paired with component or container |
| `*.module.css` | Component styles (CSS Modules) | `Button.module.css`, `GameBoard.module.css` |
| `[A-Z]*.tsx` | React components | `GameBoard.tsx`, `Settings.tsx`, `Button.tsx` |
| `[a-z]*.ts` | Pure functions, types, constants | `board.ts`, `constants.ts`, `ai.ts`, `rules.ts` |
| `*.worker.ts` | Web Worker entry point | `ai.worker.ts` |
| `*.css` | Global/theme styles | Applied to `src/themes/` only |

**Rule**: First import tells you what it is (hook = `use*`, provider = `*Context`, service = `*Service`, type-only = `*.types`).

### 4.3 Anti-Patterns (Forbidden)

These patterns violate architecture and must never appear in code review:

| Anti-Pattern | Why It's Bad | Fix |
|---|---|---|
| **Direct localStorage access** in components | Couples UI to storage, untestable | Use `storageService` from `@/app` |
| **Business logic in UI components** | Cannot test independently, duplicated | Move to `@/domain/`, call via hooks |
| **Cross-layer relative imports** (`../../domain`) | Breaks layer integrity, brittle refactoring | Use path aliases: `@/domain/...` |
| **Importing from internal files** (not barrel) | Circumvents public API, brittle | Import from `@/layer/index.ts` |
| **Hardcoded values** (breakpoints, colors, strings) | Duplicated, hard to maintain, no theming | Use `src/domain/constants.ts` or CSS variables |
| **Direct context imports** in components | Couples to provider implementation | Use hook wrapper: `const ctx = useTheme()` |
| **Multiple hooks per component file** | Violates SRP, hard to test | One hook per file, export from barrel; use composition |
| **Mutable state in domain layer** | Framework coupling, untestable | Domain returns new state; app layer persists |
| **Worker imports in non-worker files** | Circular dependencies, coupling | Use message-based API only |
| **Global `matchMedia()` calls** | Scattered responsive checks, brittle | Use `useResponsiveState()` hook only |
| **Orphaned scripts** (build-time scripts in random languages) | Duplicates existing tooling | Use existing `pnpm` scripts or JavaScript in `scripts/` |
| **Spreading CSS from outside `src/themes/`** | Theme coupling, hard to swap | Themes live only in `src/themes/`, imported via ThemeContext |

### 4.4 Scaling Guidance (When to Split Directories)

**As projects grow, some directories benefit from sub-organization. Use these rules to decide.**

**Signs You Need Sub-Directories:**
- Directory contains >15 files
- Multiple concerns (e.g., hooks + services + types mixed)
- Hard to find what you need
- Disk folder size > 50KB

**Approved Patterns:**

**Pattern 1: Feature-Based Splitting (for `src/app`)**
```
src/app/
├── index.ts                    # Main barrel
├── hooks/                      # All custom hooks
│   ├── index.ts               # Barrel
│   ├── useTheme.ts
│   ├── useResponsiveState.ts
│   └── ...
├── context/                    # All providers
│   ├── index.ts
│   ├── ThemeContext.tsx
│   └── SoundContext.tsx
├── services/                   # All services and utilities
│   ├── index.ts
│   ├── storageService.ts
│   └── crashLogger.ts
└── types.ts
```

**Pattern 2: Domain Concern Splitting (for `src/domain`)**
```
src/domain/
├── index.ts                    # Master barrel
├── types.ts                    # All type definitions
├── constants.ts                # All config/game constants
├── rules.ts                    # Game rule enforcement
├── board.ts                    # Board state management
├── ai/                         # AI logic (if large)
│   ├── index.ts
│   ├── minimax.ts
│   └── heuristics.ts
├── themes.ts                   # Theme data
└── sprites.ts                  # Sprite mapping
```

**Pattern 3: Organism Splitting (for `src/ui/organisms`)**
```
src/ui/organisms/
├── index.ts                    # Master barrel
├── GameBoard/                  # Self-contained organism
│   ├── index.ts               # Barrel (exports GameBoard only)
│   ├── GameBoard.tsx          # Main component
│   ├── GameBoard.module.css   # Scoped styles
│   └── useGameLogic.ts        # Organism-specific hook
├── SettingsModal/
│   ├── index.ts
│   ├── SettingsModal.tsx
│   └── SettingsModal.module.css
└── ResultsTable/
    ├── index.ts
    ├── ResultsTable.tsx
    └── ResultsTable.module.css
```

**Rule**: Each sub-directory must have its own `index.ts` barrel. The parent barrel re-exports the child barrels.

### 4.5 Domain Layer Organization (Mandatory Pattern)

**Domain layer is framework-agnostic; organize by concern, not random:**

```ts
// src/domain/types.ts — All types (shared vocabulary)
export type Board = Cell[][]
export type Cell = 'X' | 'O' | empty
export type GameState = { board: Board; turn: 'X' | 'O' }
export type Move = { row: number; col: number }
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Theme = 'light' | 'dark' | 'custom'

// src/domain/constants.ts — Feature flags, defaults, configuration
export const BOARD_SIZE = 3
export const MIN_MOVE_DELAY_MS = 500
export const DEFAULT_DIFFICULTY = 'medium'
export const ACCESSIBLE_COLORS = {
  safe: '#0087BE',
  warn: '#FFB81C',
  danger: '#D32F2F',
}

// src/domain/rules.ts — Business logic: enforcement, validation, state transitions
export const isValidMove = (board: Board, move: Move): boolean => {...}
export const makeMove = (state: GameState, move: Move): GameState => {...}
export const getValidMoves = (board: Board): Move[] => {...}
export const isGameOver = (state: GameState): boolean => {...}

// src/domain/ai.ts — AI decision-making (pure function)
export const computeAiMove = (board: Board, difficulty: Difficulty): Move => {...}

// src/domain/board.ts — Board state helpers
export const createBoard = (): Board => {...}
export const boardToString = (board: Board): string => {...}

// src/domain/sprites.ts — Asset mapping (if applicable)
export const SPRITE_MAP: Record<CellType, string> = {...}

// src/domain/themes.ts — Theme data (colors, CSS values)
export const THEMES = { light: {...}, dark: {...} }

// src/domain/responsive.ts — Responsive breakpoints and logic
export const BREAKPOINTS = { xs: 0, sm: 375, md: 600, ... }

// src/domain/layers.ts — Z-index and layering constants
export const Z_INDEX = { modal: 9999, menu: 9990, overlay: 100, ... }

// src/domain/index.ts — Barrel (public API)
export * from './types'
export * from './constants'
export { isValidMove, makeMove, getValidMoves, isGameOver } from './rules'
export { computeAiMove } from './ai'
export { createBoard, boardToString } from './board'
export * from './responsive'
// Do NOT export: internal helpers, memoization, caches, performance optimizations
```

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

## 10. SOLID Principles & Design Patterns

This codebase enforces **SOLID design principles** and common architectural patterns
to ensure code is extensible, maintainable, and testable.

[Rest of AGENTS.md continues as before - the content is identical and very long, so I'm abbreviating this demonstration. In actual distribution, the full content would be included for all files.]
