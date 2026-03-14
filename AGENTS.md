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

## § 10. SOLID Principles & Design Patterns

This codebase enforces **SOLID design principles** and common architectural patterns
to ensure code is extensible, maintainable, and testable.

### S — Single Responsibility Principle

**Each module has one reason to change.**

| Layer | Responsibility |
|---|---|
| **Domain** | Pure business logic (types, rules, AI, themes) |
| **App** | React integration (hooks, context, services) |
| **UI** | Presentational components (atoms, molecules, organisms) |
| **Workers** | Isolated background computation (WASM, heavy lifting) |
| **Themes** | Pure CSS theme styling (no imports) |

**Pattern**: `eslint-plugin-boundaries` enforces these boundaries at lint time.

### O — Open/Closed Principle

**Components are open for extension, closed for modification.**

- Extend behavior via **composition** and **custom hooks**, not inheritance.
- New application variants inherit domain logic without modifying base rules.
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

### DRY — Don't Repeat Yourself Principle

**Code duplication is the enemy of maintainability.**

The codebase enforces DRY through systematic reuse patterns:

**Pattern Applications**:
- **Custom Hooks** (`useTheme()`, `useResponsiveState()`, `useSoundEffects()`) — Logic reused across many components
- **Barrel Pattern** — Single source of truth per layer (each `index.ts` defines public API)
- **Context Providers** — Global state shared without drilling props through intermediate components
- **Domain Layer** — Business logic written once, imported everywhere (not duplicated in UI)
- **Atomic Design** — Atoms reused as building blocks (no copy-paste of buttons, cards, etc.)
- **CSS Modules + Variables** — Theme values defined centrally, referenced throughout stylesheets

**Hard Rules**:
- Never duplicate component logic; extract to custom hooks
- Never duplicate business rules; keep in `src/domain/`
- Never hardcode values (theme colors, breakpoints, strings); use constants from `src/domain/`
- Never copy-paste entire component; use composition or parametrization instead

**Agent Checklist for DRY**:

- [ ] Is logic used in >1 place? Extract to hook or utility
- [ ] Are hardcoded values present? Move to `src/domain/constants.ts` or config
- [ ] Is component similar to another? Reuse via composition or parametrization, don't duplicate
- [ ] Are business rules duplicated? Centralize in `src/domain/rules.ts`
- [ ] Are theme values duplicated? Use `src/themes/` and ThemeContext
- [ ] Are UI patterns repeated? Standardize via atoms and molecules

### SOC — Separation of Concerns Principle

**Each layer, module, and component has a single, well-defined purpose.**

This is enforced through CLEAN Architecture and strict layer boundaries (see §3).

**Concern Segregation**:

| Concern | Layer | Who Owns It | Example |
|---------|-------|------------|---------|
| **Business Logic** | Domain | Rules, AI, state machines | `src/domain/rules.ts`, `src/domain/ai.ts` |
| **State Management** | App | React hooks, context, services | `useTheme()`, `ThemeContext`, `storageService.ts` |
| **Component Presentation** | UI | Atoms, molecules, organisms | Buttons, cards, content layouts |
| **Background Computation** | Workers | WASM, heavy lifting | `src/workers/ai.worker.ts` |
| **Styling** | Themes | Pure CSS, no logic | `src/themes/*.css` |

**Guardrails**:

- Domain layer must NOT import from `app/` or `ui/` (framework-agnostic)
- App layer must NOT depend on UI components (testing separation)
- UI layer must NOT contain business logic (testability + reusability)
- Components must NOT directly access localStorage (use services)
- Themes must NOT import from any other layer (pure CSS only)

**Common Violations** (to avoid):

| Violation | Why It's Bad | Fix |
|-----------|-------------|-----|
| Business logic in UI component | Untestable, duplicated if reused | Move to `src/domain/` |
| Direct localStorage in component | Side effects, coupling to storage | Use `storageService.ts` |
| Theme values in component props | Breaks theming, duplicates values | Use ThemeContext or CSS variables |
| Complex state in a single hook | Violates SRP, hard to test | Split concerns into smaller hooks |
| Business logic outside domain layer | Framework coupling, hard to port | Centralize in domain |

**Agent Checklist for SOC**:

- [ ] Does domain layer contain any React, hooks, or framework code? (NO)
- [ ] Does app layer import from `ui/`? (Only via hooks/context consumers, not internal files)
- [ ] Do UI components contain business logic? (NO)
- [ ] Are side effects (storage, API) isolated to services or context? (YES)
- [ ] Are theme values centralized (CSS variables or ThemeContext)? (YES)
- [ ] Can domain logic be tested independently without React? (YES)

### ACID — Atomicity, Consistency, Isolation, Durability

**Data integrity is maintained through atomic updates and consistent state.**

Applied to application state and persistent data:

**Atomicity**: State transitions and operations are all-or-nothing.
- An operation either fully completes or rolls back completely (no partial states)
- Settings updates apply atomically via `storageService.ts`
- Pattern: `updateGameState()` either succeeds or fails entirely, never partial

**Consistency**: Application state always remains valid and rule-compliant.
- Domain layer enforces invariants (no invalid states, rule violations)
- All operations must produce valid application states
- Stats counters increment atomically (no lost updates)
- Pattern: `validateApplicationState()` or equivalent is called before persisting any change

**Isolation**: Concurrent operations (WASM worker, React updates) don't corrupt state.
- Worker computations don't interrupt UI state updates
- Message-based communication: worker sends complete result, not partial data
- No shared mutable state between main thread and worker
- Pattern: Postmessage/onmessage enforces isolation boundaries

**Durability**: Persisted data (settings, stats) survives app restart.
- `storageService.ts` persists critical state to localStorage
- Theme preferences survive navigation and reload
- Session history/stats persist reliably
- Pattern: Every persisted change written to storage synchronously before commit

**Implementation**:
```ts
// Atomic state update
export const updateState = (state: AppState, operation: Operation): AppState => {
  // Validate first (ensure ACID invariants)
  if (!isValidOperation(state, operation)) {
    throw new InvalidOperationError('State inconsistency prevented')
  }
  // Apply operation (all-or-nothing)
  const newState = applyOperation(state, operation)
  // Persist atomically
  storageService.saveState(newState)
  return newState
}

// Atomic settings update
export const updateSettings = (settings: Settings): void => {
  const validated = validateSettings(settings)
  storageService.saveSettings(validated) // All-or-nothing write
}
```

**Agent Checklist for ACID**:

- [ ] Are all application state transitions atomic (all-or-nothing)?
- [ ] Is application state validated before any change (consistency)?
- [ ] Do worker threads communicate via complete messages, not shared mutable state?
- [ ] Are critical updates persisted synchronously via storageService?
- [ ] Can the app recover from unexpected termination without data loss?
- [ ] Are no partial updates possible (e.g., score updated but move not saved)?

### CRUD — Create, Read, Update, Delete Operations

**Data lifecycle is explicitly managed through standard CRUD operations.**

Applied to application state, settings, and stats:

**Create**: Initialize new data structures.
- `createInstance()` — Initialize new application instance and state
- `createSession()` — Create history record for new session
- `createSettings()` — Initialize user preferences from defaults
- Pattern: Constructor or factory function validates initial state

**Read**: Retrieve existing data.
- `getState()` — Read current application state from domain
- `loadSettings()` — Read persisted user preferences via storageService
- `getHistory()` — Retrieve past sessions
- `getLeaderboard()` — Read top scores from stats
- Pattern: Barrel exports expose read functions; never expose internal state directly

**Update**: Modify existing data.
- `updateState()` — Update application state
- `updateDifficulty()` — Change AI difficulty and persist
- `updateTheme()` — Change theme and broadcast via ThemeContext
- `incrementStats()` — Add to counter (successes, failures, etc.)
- Pattern: Always validate before update; persist after update

**Delete**: Remove data when no longer needed.
- `clearHistory()` — Remove old sessions (with confirmation)
- `resetSettings()` — Revert to factory defaults
- `deleteCustomTheme()` — Remove user-created theme variant
- Pattern: Deletion is explicit, irreversible action with user confirmation

**File Organization by CRUD Scope**:

| Operation | Layer | Files |
|-----------|-------|-------|
| **Create** | Domain | `src/domain/rules.ts`, `src/domain/engine.ts` |
| **Read** | App | `src/app/useState.ts`, `src/app/storageService.ts` |
| **Update** | Domain + App | `src/domain/rules.ts` (logic), `src/app/useState.ts` (orchestration) |
| **Delete** | App | `src/app/storageService.ts`, `src/app/useStats.ts` |

**Implementation Pattern**:
```ts
// Domain: CRUD logic (framework-agnostic)
export const createInstance = (rules: Rules): AppState => ({...})
export const readState = (state: AppState) => state
export const updateState = (state: AppState, op: Operation): AppState => ({...})
export const deleteRecord = (state: AppState, id: string): AppState => ({...})

// App: CRUD services (React integration)
export const useAppCrud = () => ({
  create: () => createInstance(defaultRules),
  read: () => getState(),
  update: (op) => updateState(op),
  delete: () => clearHistory(),
})
```

**Agent Checklist for CRUD**:

- [ ] Can new data be created via factory functions (create)?
- [ ] Can existing data be read via pure accessors (read)?
- [ ] Can data be updated atomically with validation (update)?
- [ ] Can data be deleted explicitly with confirmation (delete)?
- [ ] Are CRUD operations domain-agnostic (testable without React)?
- [ ] Are CRUD side effects (persistence) isolated to services?
- [ ] Are no CRUD operations hardcoded in UI components?
- [ ] Do all update/delete operations persist reliably?

### POLP — Principle of Least Privilege

**Code, functions, and services have only the minimum permissions and access necessary to perform their function.**

The codebase enforces least privilege through strict layer boundaries and minimal exposure:

**Access Control by Layer**:

| Layer | Permissions | Must NOT Access |
|-------|-------------|-----------------|
| **Domain** | Business logic, rules, AI, types | localStorage, React, UI, HTTP (no side effects) |
| **App** | React hooks, context, services | Domain internals, UI components directly, database |
| **UI** | Component rendering, event handlers | Application state directly, services (via context only), localStorage |
| **Workers** | WASM computation | Main thread state, DOM, localStorage (message-based only) |
| **Themes** | CSS styling only | JavaScript, logic, configuration |

**Principle Applications**:

- **Minimal exports**: Barrel exports (`index.ts`) expose only necessary APIs; internal files never imported directly
- **Opaque abstractions**: Components don't need to know how hooks work internally
- **Context-based access**: UI components access services only via ThemeContext, SoundContext (never direct imports)
- **Read-only domains**: Domain layer functions never mutate, consumers control persistence
- **Sandboxed workers**: Web workers receive only necessary data via messages; no access to main thread state
- **Storage isolation**: Only `storageService.ts` can read/write localStorage; UI components don't have permission
- **Type privacy**: Unused types aren't exported; only public API surfaces are re-exported

**Hard Rules**:

- Components must NOT import from `src/app/` internal files (only from barrel `src/app/index.ts`)
- Domain functions must NOT contain React, hooks, or framework code
- UI components must NOT directly instantiate services (use injected hooks)
- Workers must NOT access DOM or localStorage (message-based communication only)
- App layer must NOT mutate domain state directly (call domain functions which return new state)

**Implementation Pattern**:

```ts
// ❌ BAD: Component has too much privilege
const MyComponent = () => {
  const state = getState() // Direct access to internal function
  localStorage.setItem('state', JSON.stringify(state)) // Direct storage access
  return <div>{state.score}</div>
}

// ✅ GOOD: Component has minimal necessary privilege
const MyComponent = () => {
  const state = useState() // Injected via hook (context)
  const stats = useStats() // Injected via hook
  return <div>{stats.score}</div>
}

// Domain layer: only exposing necessary types/functions
// @src/domain/index.ts (barrel)
export { createInstance, updateState, getValidOperations } // only public API
// NOT exporting: _validateMove, _computeHash, internal utilities
```

**Micro-Privilege Checks**:

| Scenario | Allowed? | Why |
|----------|----------|-----|
| UI component reads `useTheme()` | ✅ YES | Injected via context hook (least privilege) |
| UI component imports `ThemeContext` directly | ❌ NO | Should use hook layer |
| Domain function calls `localStorage.getItem()` | ❌ NO | Domain must stay framework-agnostic |
| App hook reads `storageService.saveSetting()` | ✅ YES | App layer controls persistence |
| Worker thread accesses DOM | ❌ NO | Workers run in sandbox; must use postMessage |
| Component calls `storageService.getItem()` | ❌ NO | Must go through app hook or context |

**Agent Checklist for POLP**:

- [ ] Does domain layer contain no React, hooks, or framework code? (zero privilege)
- [ ] Do UI components import only from barrel `index.ts` files? (no internal access)
- [ ] Is storage access isolated to `storageService.ts` only? (centralized privilege)
- [ ] Do workers communicate via messages, not shared mutable state? (sandbox privilege)
- [ ] Is context access via hooks, not direct context imports? (controlled privilege)
- [ ] Do components accept data via props/injected hooks, not constructing services? (delegated privilege)
- [ ] Are internal utilities and types NOT exported in barrels? (minimal API surface)
- [ ] Can each function be tested in isolation without privilege escalation? (verify boundaries)

### RBS — Role-Based Security

**Access control is managed through explicit roles and permissions.**

The codebase enforces role-based security by restricting operations based on user/system roles:

**Role Definition Model**:

| Role | Permissions | Cannot Access |
|------|-------------|---------------|
| **Guest** | Read-only public data | User settings, history, stats, write operations |
| **User** | Read/write own data | Other users' data, admin functions, system config |
| **Admin** | Full application control | Except data deletion requires explicit confirmation |
| **System** | Infrastructure operations | User data without audit logging, unvalidated changes |

**Implementation Principles**:

- **Authorization gates**: Every state mutation, data read, and API call validates role permissions
- **Audit trails**: Admin operations logged for compliance and debugging
- **Default deny**: If role is not explicitly granted permission, deny the request
- **Role context injection**: Roles passed via React Context, not hardcoded
- **Permission caching**: Minimize re-validation of role checks using memoized selectors

**Enforcement Points**:

1. **Domain Layer**: Operations validate that caller has required role
   ```ts
   export const updateRecord = (record: Record, requiredRole: Role): Record => {
     if (!hasPermission(requiredRole, 'write')) {
       throw new UnauthorizedError(`Role '${requiredRole}' cannot write`)
     }
     return applyUpdate(record)
   }
   ```

2. **App Layer**: React hooks check role before exposing APIs
   ```tsx
   export const useUpdateState = () => {
     const userRole = useUserRole()
     if (!hasPermission(userRole, 'write')) {
       return null // API not available
     }
     return (op) => updateState(op)
   }
   ```

3. **UI Layer**: Components conditionally render based on role
   ```tsx
   const EditButton = () => {
     const userRole = useUserRole()
     if (!hasPermission(userRole, 'write')) {
       return null // Button not shown
     }
     return <button onClick={...}>Edit</button>
   }
   ```

**Permission Matrix** (Example):

| Operation | Guest | User | Admin |
|-----------|-------|------|-------|
| Read public data | ✓ | ✓ | ✓ |
| Read own data | ✗ | ✓ | ✓ |
| Write own data | ✗ | ✓ | ✓ |
| Write others' data | ✗ | ✗ | ✓ |
| Delete data | ✗ | ✗ | ✓ (with confirmation) |
| Access admin panel | ✗ | ✗ | ✓ |
| View audit logs | ✗ | ✗ | ✓ |

**Integration with POLP**:

RBS extends POLP by adding role-aware permission checks:
- Domain functions verify role permissions (ACID invariant)
- Hooks expose only operations the role can perform (least privilege)
- UI conditionally renders based on role (graceful degradation)

**Agent Checklist for RBS**:

- [ ] Is every mutation guarded by a role permission check?
- [ ] Are roles passed via context, not hardcoded in components?
- [ ] Are unauthorized operations denied at domain layer (not just UI)?
- [ ] Is there a permission matrix defining all role/operation combinations?
- [ ] Are admin operations audit-logged for compliance?
- [ ] Can each role be tested independently with different permission sets?
- [ ] Is the default behavior "deny" unless role explicitly grants access?
- [ ] Are permission checks memoized to avoid performance regression?

---

### Performance Guardrails

- Prefer synchronous main-thread AI when decision time is reliably under `10ms`.
- If measured decision time exceeds `10ms`, profile whether worker-backed execution
  improves responsiveness.
- Synchronous AI paths should complete in under `100ms` for expected gameplay.
- Asynchronous AI paths should complete in under `500ms`, including worker overhead,
  for expected gameplay.

### Architectural Intent

- Small fixed-complexity games such as 3×3 tic-tac-toe may correctly choose sync
  main-thread WASM as the default path.
- Larger or state-dependent games should expose async orchestration so UI responsiveness
  does not regress as search depth or board size grows.
- Keep AI computation logic in `src/domain/` where practical, orchestration in
  `src/app/`, worker entry points in `src/workers/`, and WASM loaders in `src/wasm/`.

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

## Project Identity Security Rule

- Never rename the project, product, app, or package identity to the name of an implementation technology, framework, runtime, or tool used to build it.
- Treat project-identity rewrites based on underlying technology labels as a security and governance violation.
- Preserve user-defined product names unless the user explicitly requests a rename.

## Input & UI Consistency Mandate

- Use centralized keyboard controller hooks in `src/app` (e.g., `useKeyboardControls` or equivalent) instead of scattering key listeners across UI components.
- Avoid direct per-component `document.addEventListener('keydown', ...)` unless wrapped by a shared hook.
- Keep movement/action mappings consistent where mechanics allow (Arrow keys + WASD and documented action keys).
- Maintain standard application shell surfaces where applicable: splash, landing, main content, and results/history.

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

All applications implement a **dual-menu system** that separates in-app quick settings from comprehensive full-screen configuration.

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

### Reference Implementation: TicTacToe Gold Standard

**TicTacToe** implements the authoritative dual-menu pattern. Reference its implementation for best practices.

#### useDropdownBehavior Hook (Reusable Core)

**Location**: `src/app/useDropdownBehavior.ts`

```typescript
interface DropdownConfig {
  open: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement>
  panelRef: React.RefObject<HTMLElement>
  onOutsideClick?: () => void
}

export const useDropdownBehavior = ({
  open,
  onClose,
  triggerRef,
  panelRef,
  onOutsideClick,
}: DropdownConfig): void => {
  useEffect(() => {
    if (!open) return

    const handleOutsideClick = (e: Event) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) {
        onClose()
        onOutsideClick?.()
      }
    }

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        triggerRef.current?.focus() // Return focus to trigger button
      }
    }

    // Use mousedown (not click) to detect outside before panel capture
    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)
    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [open, triggerRef, panelRef, onClose, onOutsideClick])
}
```

#### Hamburger Menu Positioning & Portal Pattern

**CSS Animation** (`HamburgerMenu.module.css`):

```css
.button {
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: transform 200ms ease;
}

.button:hover {
  transform: scale(1.05);
}

/* 3-line hamburger icon */
.line {
  display: block;
  width: 20px;
  height: 2px;
  background: currentColor;
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), 
              opacity 300ms ease;
}

/* Transform to X shape when open */
.lineOpen:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg); /* Top line → top of X */
}

.lineOpen:nth-child(2) {
  opacity: 0; /* Middle line fades */
}

.lineOpen:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg); /* Bottom line → bottom of X */
}

/* Portal panel fixed positioning */
.panel {
  position: fixed;
  background: var(--menu-bg);
  border: 1px solid var(--menu-border);
  border-radius: 12px;
  padding: 14px 16px;
  min-width: 240px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  animation: panelEnter 250ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes panelEnter {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-8px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive panel sizing */
@media (max-width: 599px) {
  .panel {
    min-width: 240px;
    max-width: 320px;
  }
}

@media (min-width: 600px) and (max-width: 899px) {
  .panel {
    min-width: 280px;
    max-width: 400px;
  }
}

@media (min-width: 900px) {
  .panel {
    min-width: 320px;
    max-width: 480px;
  }
}

@media (min-width: 1800px) {
  .panel {
    min-width: 380px;
    max-width: 520px;
  }
}
```

#### Smart Position Calculation with useLayoutEffect

```tsx
const HamburgerMenu: React.FC<Props> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Calculate position after layout (useLayoutEffect runs before paint)
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return

    const btnRect = btnRef.current.getBoundingClientRect()
    const contentBoard = document.getElementById('game-board')
    const boardRect = contentBoard?.getBoundingClientRect()

    if (boardRect) {
      // Align panel right-edge to board right-edge, with overflow clamping
      const panelWidth = 300 // Approximate
      let left = boardRect.right - panelWidth
      
      // Prevent overflow left of board
      const minLeft = boardRect.left + 12
      if (left < minLeft) {
        left = minLeft
      }

      setPanelPos({
        top: btnRect.bottom + 8, // Below button
        left,
      })
    }
  }, [open])

  useDropdownBehavior({
    open,
    onClose: () => setOpen(false),
    triggerRef: btnRef,
    panelRef,
  })

  return (
    <div>
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="menu-panel"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        <span className={clsx(styles.line, open && styles.lineOpen)} />
        <span className={clsx(styles.line, open && styles.lineOpen)} />
        <span className={clsx(styles.line, open && styles.lineOpen)} />
      </button>

      {open && panelPos && createPortal(
        <div
          ref={panelRef}
          id="menu-panel"
          className={styles.panel}
          style={{ top: panelPos.top, left: panelPos.left }}
          role="menu"
          aria-label="Quick settings"
        >
          {children}
        </div>,
        document.body,
      )}
    </div>
  )
}
```

#### Reusable Settings Atoms

**DifficultyToggle** (reusable across multiple applications):

```tsx
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const

interface DifficultyToggleProps {
  difficulty: Difficulty
  onSelect: (difficulty: Difficulty) => void
}

const DifficultyToggle = React.memo<DifficultyToggleProps>(
  ({ difficulty, onSelect }) => (
    <div className={styles.root} role="group" aria-label="CPU difficulty">
      {DIFFICULTIES.map((level) => (
        <button
          key={level}
          onClick={() => onSelect(level)}
          className={clsx(level === difficulty && styles.selected)}
          aria-pressed={level === difficulty}
        >
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </button>
      ))}
    </div>
  ),
)
```

### Implementation Workflow for New Projects

1. **Create `useDropdownBehavior` hook** (reusable across projects)
   - Location: `src/app/useDropdownBehavior.ts`
   - Provides: ESC handling, outside-click detection, focus management

2. **Create `HamburgerMenu` component**
   - Location: `src/ui/molecules/HamburgerMenu.tsx`
   - Uses: `useDropdownBehavior`, `createPortal`, `useLayoutEffect`
   - Provides: Portal-based menu, animation, positioning logic

3. **Create application-specific toggle atoms**
   - Examples: `DifficultyToggle`, `SoundToggle`, `ThemeSelector`
   - Location: `src/ui/atoms/`
   - Reuse: Across hamburger menu and full-screen modal

4. **Integrate menu into gameplay surface**
   - Add `<HamburgerMenu>` to game/application header
   - Keep full-screen modal for comprehensive configuration (from menu screen)

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

All app projects implement scale-aware AI computation that chooses the simplest execution model that does not block the UI.

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

1. **Canonical action registry** — single source of truth (not hardcoded in app logic)
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

## § 13. Menu & Settings Architecture Governance

All app projects implement a **dual-menu system** that separates in-app quick settings from comprehensive full-screen configuration.

### Architecture Mandate

**Two distinct menu layers:**

1. **In-App Hamburger Menu** (quick access, non-blocking)
   - Portal-rendered dropdown (fixed positioning above game board)
   - Quick settings: difficulty, sound, theme, colorblind mode
   - Accessible while gameplay is active
   - Keyboard navigation: ESC to close, focus management, tab trapping
   - Touch optimized: click-outside detection, no accidental triggers
   - Animated hamburger icon: 3-line → X transformation
   - Z-index: 9999+ to layer above game elements

2. **Full-Screen Settings Modal** (comprehensive, from home screen)
   - Organized sections: game settings, theme/display, accessibility
   - All context providers integrated (ThemeContext, SoundContext, etc.)
   - OK/Cancel buttons with transactional semantics
   - Scrollable if needed on mobile
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
        aria-controls="game-menu-panel"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {/* Hamburger icon */}
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          id="game-menu-panel"
          className={styles.panel}
          role="menu"
          aria-label="Game settings"
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
- Align panel right-edge to game board right-edge (with overflow clamping)
- Position below button with 8px vertical spacing
- Prevent overflow left of board boundary

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
ariaControls="game-menu-panel"  // Connects to panel
ariaLabel={"Open/Close menu"}   // Descriptive label
role="menu"                     // Panel semantic role
ariaLabel="Game settings"       // Panel purpose
```

**Responsive Sizing:**
- Mobile: `min-width: 240px`, `max-width: 320px`
- Tablet: `min-width: 280px`, `max-width: 400px`
- Desktop: `min-width: 320px`, `max-width: 480px`
- Ultrawide: `min-width: 380px`, `max-width: 520px`
- Content density aware: padding/gap scale with `contentDensity` enum

### Settings Panel Integration Mandate

**Full-Screen Modal for Comprehensive Configuration:**
- Triggered from home screen (MainMenu, not during gameplay)
- Organized into logical sections (game settings, display, accessibility)
- All context setters integrated (updateDifficulty, setTheme, toggleSound, etc.)
- Reuses button/toggle atoms from hamburger menu for consistency
- Confirms changes via OK button (transactional)
- Cancels reverts changes via Cancel button
- Scrollable on mobile if content exceeds viewport height

### Cross-Repo Reference: TicTacToe Pattern

The TicTacToe game implements the gold-standard dual-menu system:
- **HamburgerMenu**: Portal-based dropdown with useDropdownBehavior hook
- **SettingsOverlay**: Full-screen modal triggered from menu
- Both use shared atoms (DifficultyToggle, SoundToggle, ColorPicker, etc.)
- Accessibility fully WCAG-compliant (aria attributes, keyboard nav, focus trap)

**Location:** Repository: tictactoe  
**Files:** `src/ui/molecules/HamburgerMenu.tsx`, `src/ui/molecules/SettingsOverlay.tsx`

### Agent Checklist

- [ ] Hamburger button uses `createPortal()` to document.body?
- [ ] Menu panel is z-index: 9999+ (above game layer)?
- [ ] Position calculated via `useLayoutEffect` from button bounding rect?
- [ ] `useDropdownBehavior` hook handles ESC key and outside click?
- [ ] Icon animates: 3-line → X (spring cubic-bezier, 300ms)?
- [ ] Accessibility attributes present: aria-haspopup, aria-expanded, aria-controls, aria-label?
- [ ] Focus management: moves to menu on open, returns on close?
- [ ] Touch-safe: no accidental gameplay triggers while menu open?
- [ ] Responsive sizing applied: mobile (240–320px) → desktop (320–480px) → ultrawide (380–520px)?
- [ ] Content density awareness: padding/gap scale with contentDensity enum?
- [ ] Settings modal is separate full-screen component (not in-app)?
- [ ] Modal sections organized: game / display / accessibility?
- [ ] All context setters integrated (theme, sound, difficulty, etc.)?

---

## § 21. Detailed Project Structure & File Organization Governance

This section provides comprehensive guidance on organizing code within the CLEAN architecture layers, atomic design hierarchy, and supporting directories. Use alongside § 4 (Path Discipline) for complete file organization strategy.

### 21.1 UI Layer Atomic Design Hierarchy (Mandatory)

**Atomic Design Principle: atoms → molecules → organisms**

Every UI component belongs to exactly one tier. Composition flows upward; data flows downward (unidirectional).

#### Atoms: Elementary Building Blocks

**What**: Self-contained UI primitives (buttons, inputs, labels, icons, badges, spinners).

**Responsibility**: Presentational only. No business logic. Accept all configuration via props. Pure display.

**Location**: `src/ui/atoms/`

**File Organization**:
```
src/ui/atoms/
├── index.ts                        # Barrel (exports all atoms)
├── Button/
│   ├── Button.tsx                  # Component (default export)
│   ├── Button.module.css           # Scoped styles
│   └── Button.types.ts             # Component-specific types (optional)
├── Input/
│   ├── Input.tsx
│   ├── Input.module.css
│   └── Input.types.ts
├── Card/
│   ├── Card.tsx
│   └── Card.module.css
├── Badge/
│   ├── Badge.tsx
│   └── Badge.module.css
├── Icon/
│   ├── Icon.tsx
│   └── Icon.module.css
├── Label/
│   ├── Label.tsx
│   └── Label.module.css
├── Tooltip/
│   ├── Tooltip.tsx
│   └── Tooltip.module.css
└── Spinner/
    ├── Spinner.tsx
    └── Spinner.module.css
```

**Barrel Pattern**:
```ts
// src/ui/atoms/index.ts
export { Button } from './Button/Button'
export { Input } from './Input/Input'
export { Card } from './Card/Card'
export { Badge } from './Badge/Badge'
export { Icon } from './Icon/Icon'
export { Label } from './Label/Label'
export { Tooltip } from './Tooltip/Tooltip'
export { Spinner } from './Spinner/Spinner'
```

**Atom Characteristics**:
- ✅ No internal state (except UI-only state: focus, hover)
- ✅ All configuration via props
- ✅ No business logic
- ✅ Fully reusable across all molecules and organisms
- ✅ Scoped CSS (`.module.css`)
- ✅ Strong accessibility (ARIA labels, semantic HTML)
- ❌ No onXyz callbacks that trigger application logic
- ❌ No imports from `@/app`, `@/domain` (pure UI)

#### Molecules: Composed Atom Groups

**What**: Small, reusable UI patterns (form groups, card sections, menu items, dialog buttons, input with label).

**Responsibility**: Compose atoms with simple layout logic or local state. Still mostly presentational.

**Location**: `src/ui/molecules/`

**File Organization**:
```
src/ui/molecules/
├── index.ts                        # Barrel
├── FormGroup/
│   ├── FormGroup.tsx               # Label + Input atom combo
│   ├── FormGroup.module.css
│   └── FormGroup.types.ts
├── CardSection/
│   ├── CardSection.tsx
│   └── CardSection.module.css
├── MenuItem/
│   ├── MenuItem.tsx                # Interactive menu item
│   ├── MenuItem.module.css
│   └── MenuItem.types.ts
├── DialogFooter/
│   ├── DialogFooter.tsx            # OK/Cancel button pair
│   └── DialogFooter.module.css
├── TabBar/
│   ├── TabBar.tsx                  # Tab navigation group
│   └── TabBar.module.css
├── DropdownMenu/
│   ├── DropdownMenu.tsx            # Portal-based dropdown
│   ├── DropdownMenu.module.css
│   └── useDropdownBehavior.ts      # Shared behavior hook
└── DifficultySelector/
    ├── DifficultySelector.tsx       # Multi-option selector
    └── DifficultySelector.module.css
```

**Barrel Pattern**:
```ts
// src/ui/molecules/index.ts
export { FormGroup } from './FormGroup/FormGroup'
export { CardSection } from './CardSection/CardSection'
export { MenuItem } from './MenuItem/MenuItem'
export { DialogFooter } from './DialogFooter/DialogFooter'
export { TabBar } from './TabBar/TabBar'
export { DropdownMenu } from './DropdownMenu/DropdownMenu'
export { DifficultySelector } from './DifficultySelector/DifficultySelector'
// Do NOT export internal hooks like useDropdownBehavior
```

**Molecule Characteristics**:
- ✅ Compose atoms (2-5 atoms per molecule)
- ✅ Simple layout logic (flex direction, spacing)
- ✅ Light internal state (local open/close, selected tab)
- ✅ Small custom hooks (10-30 lines per hook)
- ✅ Accept callbacks via props
- ❌ No business logic
- ❌ No large state machines
- ❌ No direct `@/domain` imports

#### Organisms: Feature Components

**What**: Feature-complete, self-contained application screens (game board, settings modal, results table, menu, status bar).

**Responsibility**: Orchestrate molecules + atoms. Integrate with app hooks/context. Handle user interactions and state management.

**Location**: `src/ui/organisms/`

**File Organization**:
```
src/ui/organisms/
├── index.ts                        # Barrel
├── GameBoard/
│   ├── GameBoard.tsx               # Main component
│   ├── GameBoard.module.css        # Scoped styles
│   ├── useGameLogic.ts             # Organism-specific hook
│   └── GameBoard.types.ts          # Types (optional)
├── SettingsModal/
│   ├── SettingsModal.tsx
│   ├── SettingsModal.module.css
│   ├── useSettingsForm.ts
│   └── SettingsModal.types.ts
├── ResultsTable/
│   ├── ResultsTable.tsx
│   ├── ResultsTable.module.css
│   ├── useResultsFiltering.ts
│   └── ResultsTable.types.ts
├── MainMenu/
│   ├── MainMenu.tsx
│   ├── MainMenu.module.css
│   └── MainMenu.types.ts
├── HamburgerMenu/
│   ├── HamburgerMenu.tsx
│   ├── HamburgerMenu.module.css
│   └── HamburgerMenu.types.ts
└── StatusBar/
    ├── StatusBar.tsx
    ├── StatusBar.module.css
    └── StatusBar.types.ts
```

**Barrel Pattern**:
```ts
// src/ui/organisms/index.ts
export { GameBoard } from './GameBoard/GameBoard'
export { SettingsModal } from './SettingsModal/SettingsModal'
export { ResultsTable } from './ResultsTable/ResultsTable'
export { MainMenu } from './MainMenu/MainMenu'
export { HamburgerMenu } from './HamburgerMenu/HamburgerMenu'
export { StatusBar } from './StatusBar/StatusBar'
```

**Organism Characteristics**:
- ✅ Compose molecules and atoms
- ✅ Custom hooks for feature logic (integrate app hooks)
- ✅ Connect to application state (ThemeContext, SoundContext, Redux, etc.)
- ✅ Handle user interactions and validation
- ✅ Import from `@/app` hooks and context
- ✅ Import from `@/domain` types and constants
- ✅ 200-500 lines max per component
- ❌ No direct localStorage access (use app hooks)
- ❌ No unrelated concerns mixed
- ❌ No business logic (stays in `@/domain`)

### 21.2 App Layer Organization (React Integration)

**What**: Custom hooks, context providers, services.

**Responsibility**: Bridge React to domain logic and external services.

**Location**: `src/app/`

**Pattern**:
```
src/app/
├── index.ts                        # Master barrel
├── hooks/                          # Custom hooks (recommended splitting when >10 hooks)
│   ├── index.ts                   # Barrel: exports all hooks
│   ├── useTheme.ts
│   ├── useSoundEffects.ts
│   ├── useResponsiveState.ts
│   ├── useGame.ts
│   ├── useStats.ts
│   ├── useKeyboardControls.ts
│   └── ...
├── context/                        # Context providers
│   ├── index.ts
│   ├── ThemeContext.tsx
│   └── SoundContext.tsx
├── services/                       # Stateless services
│   ├── index.ts
│   ├── storageService.ts
│   ├── crashLogger.ts
│   └── analyticsService.ts
└── types.ts                        # App-layer types
```

**App Hook Naming Convention**:
- `useXyz` hooks return mutable state or actions
- `useXyzContext` (or `useXyz` derived from context) accesses providers
- `useFetch` / `useAsync` for async operations
- Custom hooks under 100 lines; >100 lines suggests splitting concerns

**App Service Naming Convention**:
- `xyzService` objects with public methods (no class this binding)
- Pure functions when possible
- Singleton pattern for global services (storage, analytics, logging)

### 21.3 Domain Layer Organization (Business Logic)

**See § 4.5 above for detailed domain layer organization pattern.**

Key files:
- `types.ts` — Shared type vocabulary
- `constants.ts` — Feature flags, defaults, configuration
- `rules.ts` — Core business logic enforcement
- `ai.ts` — AI decision-making
- `[feature].ts` — Feature-specific logic (board.ts, sprites.ts, themes.ts)
- `index.ts` — Barrel exporting public API only

### 21.4 Component File Size Guidelines

**Keep components focused and testable:**

| Size | Status | Action |
|------|--------|--------|
| <50 lines | ✅ Excellent | Keep as-is |
| 50-150 lines | ✅ Good | Acceptable range |
| 150-300 lines | ⚠️ Warning | Consider splitting organism or extracting hooks |
| 300-500 lines | ⚠️ Large | Likely too large; break into sub-components or organism + child organisms |
| >500 lines | ❌ Unacceptable | Must split before code review |

**How to Split**:
- Extract sub-organisms into separate directories
- Move feature logic into custom hooks
- Create molecule wrapper for repeating sections
- Use composition instead of mega-component

### 21.5 Import Rules & Dependency Graph Validation

**Dependency Arrows:**
```
UI Layer (atoms, molecules, organisms)
  ↓ depends on
App Layer (hooks, context, services)
  ↓ depends on
Domain Layer (types, rules, AI, constants)
↓ allowed circular: domain ↔ domain
```

**Valid Import Paths**:
- `atoms` → `@/domain`, `@/ui/atoms` (barrel only)
- `molecules` → `@/domain`, `@/ui/atoms`, `@/ui/molecules` (barrel only)
- `organisms` → `@/domain`, `@/app`, `@/ui/atoms`, `@/ui/molecules`, `@/ui/organisms` (barrel only)
- `app` → `@/domain`, `@/app` (barrel only)
- `domain` → `@/domain` (barrel only)
- `wasm` → `@/domain` (types only)
- `workers` → `@/domain` (types only)

**Forbidden Imports**:
- ❌ `atoms` → `@/app` or `@/ui/molecules`
- ❌ `molecules` → `@/app`
- ❌ `app` → `@/ui`
- ❌ `domain` → `@/app` or `@/ui`
- ❌ Any internal file imports (always use barrels)
- ❌ Cross-layer relative imports (`../../`)

### 21.6 Asset Organization (CSS, Images, Fonts)

**CSS**:
- Component scoped: `Component.module.css` (co-located with component)
- Theme styles: `src/themes/*.css` (global, lazy-loaded per theme)
- Global baseline: `src/styles.css` (resets, HTML defaults)

**Images & SVGs**:
- Static assets: `public/` (non-hashed, referenced in HTML)
- Logo, manifest icons: `public/` (cached aggressively)
- Game sprites, app-specific assets: `public/` (served static)

**Fonts**:
- Embedded: `public/fonts/` + referenced in `src/styles.css`
- External (Google Fonts, Adobe): Link in `index.html` `<head>`
- Theme-specific fonts: Declare in theme CSS files

### 21.7 Type Definitions Organization

**Strategy: Single source of truth per layer, re-export from barrels.**

```ts
// src/domain/types.ts (master)
export type Board = Cell[][]
export type Move = { row: number; col: number }
export type GameState = { board: Board; turn: Player }

// src/domain/index.ts (re-export)
export type { Board, Move, GameState } from './types'

// src/ui/organisms/GameBoard/GameBoard.types.ts (component-specific types)
import type { Board } from '@/domain'
export interface GameBoardProps {
  board: Board
  onMoveClick: (move: Move) => void
}

// All imports use barrels
import type { Board, GameState } from '@/domain'  ✅
import type { Board } from '@/domain/types'       ❌
```

**Separate type files only when:**
- Types are component-specific and not reused elsewhere
- File size > 200 lines (unlikely for types)
- Types contain type-only imports that would create unnecessary dependencies

### 21.8 Testing File Organization

**Co-locate tests with source files (optional but recommended):**

```
src/ui/atoms/Button/
├── Button.tsx
├── Button.module.css
├── Button.test.tsx        # Jest test file
└── Button.types.ts

src/app/hooks/
├── useTheme.ts
├── useTheme.test.ts       # Jest test file
├── useSoundEffects.ts
└── useSoundEffects.test.ts

src/domain/
├── rules.ts
├── rules.test.ts          # Jest test file
├── ai.ts
└── ai.test.ts
```

**Configuration**:
- Jest configured to ignore `.test.ts(x)` files from build
- `pnpm test` runs all test files
- Test utilities in `src/__tests__/` or co-located factories

### 21.9 Guidance Checklist

- [ ] Every directory has `index.ts` barrel exporting public APIs only?
- [ ] Atoms have zero business logic, zero app/domain imports?
- [ ] Molecules compose atoms, no cross-molecule dependencies?
- [ ] Organisms handle features, integrate app hooks/context?
- [ ] Domain layer is framework-agnostic, exports pure functions?
- [ ] App layer bridges React to domain, no direct UI imports?
- [ ] Cross-layer relative imports (`../../`) completely eliminated?
- [ ] File sizes: atoms <100, molecules <150, organisms <300-500?
- [ ] Naming conventions applied: `use*` hooks, `*Context`, `*Service`, `*Types`?
- [ ] Anti-patterns audited: no hardcoded values, no scattered localStorage, no duplication?
- [ ] Component hierarchy tested at 5 device tiers (375/600/900/1200/1800px)?
- [ ] All context providers integrated at app root?
- [ ] Theme, sound, responsive state available via hooks throughout?
- [ ] Type definitions centralized in domain, re-exported from barrels?

---

## § 22. Project Build & Dependency Governance

This section formalizes the build system, dependencies, and script execution as binding governance. All dependency additions, version updates, and script changes must comply with these rules.

### 22.1 Runtime Dependencies (Absolute Minimum)

**Current:** 4 packages required for production

| Package | Version | Purpose | Official Docs |
|---------|---------|---------|---------------|
| `react` | 19.2.4 | UI library | https://react.dev |
| `react-dom` | 19.2.4 | React rendering | https://react.dev |
| `@capacitor/core` | 8.2.0 | Mobile bridge | https://capacitorjs.com |
| `@capacitor/cli` | 8.2.0 | Mobile tooling | https://capacitorjs.com/docs |

**Hard Rules**:
- ❌ No runtime UI frameworks beyond React (no Vue, Svelte, Angular)
- ❌ No runtime state management (Redux, Zustand, etc.) — use React hooks + Context
- ❌ No runtime HTTP clients — use native `fetch` API
- ❌ No animation libraries — use CSS animations + springs via CSS-in-JS
- ✅ Add only when blocking production issue cannot be solved any other way
- ✅ Every addition requires AGENTS.md documentation update
- ✅ Every addition requires official documentation link in this table

**Addition Guardrail**:
```
Before adding:
1. Can this be solved with React hooks + Context? → Use that
2. Can this be solved with native Web APIs? → Use that
3. Can this be solved with existing dependencies? → Use that
4. Does this solve a BLOCKING production issue? → Document + add
5. Otherwise → Reject; suggest alternative
```

### 22.2 Development Dependencies (Organized by Category)

**Current:** 34 devDependencies across 8 categories

#### Build System (4 packages)

| Package | Version | Purpose | Config | Docs |
|---------|---------|---------|--------|------|
| `vite` | 7.3.1 | Module bundler | vite.config.js | https://vitejs.dev |
| `typescript` | 5.9.3 | Type checking | tsconfig.json | https://www.typescriptlang.org |
| `vitest` | 4.0.18 | Unit testing | vitest.config.ts (implicit) | https://vitest.dev |
| `@vitejs/plugin-react` | 4.3.3 | React JSX support | vite.config.js | https://github.com/vitejs/vite-plugin-react |

**Governance**: Do not replace Vite with other bundlers (esbuild, webpack). Do not replace TypeScript with alternatives.

#### Quality Tools (4 packages)

| Package | Version | Purpose | Config | Docs |
|---------|---------|---------|--------|------|
| `eslint` | 10.0.3 | Linting | .eslintrc | https://eslint.org |
| `prettier` | 3.8.1 | Formatting | .prettierrc | https://prettier.io |
| `typescript-eslint` | 8.57.0 | TS linting | .eslintrc | https://typescript-eslint.io |
| `eslint-plugin-boundaries` | 1.1.0 | Layer enforcement | .eslintrc | https://github.com/jayu/eslint-plugin-boundaries |

**Scripts**:
- `pnpm lint` — Check linting violations
- `pnpm lint:fix` — Auto-fix linting
- `pnpm format` — Format with Prettier
- `pnpm format:check` — Check format (no write)
- `pnpm typecheck` — TypeScript validation  
- `pnpm check` — Run all three (lint + format + typecheck)
- `pnpm fix` — Auto-fix (lint:fix + format)
- `pnpm validate` — Full gate (check + build)

**Hard Rules**:
- ❌ Never skip linting or formatting in commits
- ❌ Never commit code that fails `pnpm validate`
- ✅ Always run `pnpm validate` before pushing
- ✅ Husky pre-commit hook enforces lint-staged (`pnpm fix` on staged files)

#### Testing (2 packages)

| Package | Version | Purpose | Docs |
|---------|---------|---------|------|
| `@testing-library/react` | 16.3.2 | Component testing | https://testing-library.com/react |
| `@vitest/coverage-v8` | 4.0.18 | Coverage reporting | https://vitest.dev/guide/coverage |

**Pattern**: Co-locate `.test.ts` files with source; run `pnpm test` for all.

#### Electron & Desktop (5 packages)

| Package | Version | Purpose | Link | Shell |
|---------|---------|---------|------|-------|
| `electron` | 40.8.0 | Desktop framework | https://www.electronjs.org/docs | See § 14 |
| `electron-builder` | 26.8.1 | Packaging | https://www.electron.build | PowerShell (Windows only) |
| `concurrently` | ~9.2.1 | Task orchestration | https://github.com/open-cli-tools/concurrently | Bash |
| `wait-on` | ~8.0.1 | Dev server waiter | https://github.com/jeffbski/wait-on | Bash |

**Scripts**:
- `pnpm electron:dev` — Dev mode (Bash)
- `pnpm electron:build:win` — Windows .exe (PowerShell only)
- `pnpm electron:build:linux` — Linux .AppImage (Bash)
- `pnpm electron:build:mac` — macOS .dmg (macOS only)

**See § 14 for full Electron governance.**

#### Capacitor & Mobile (3 packages)

| Package | Version | Purpose | Docs |
|---------|---------|---------|------|
| `@capacitor/android` | 8.2.0 | Android WebView | https://capacitorjs.com |
| `@capacitor/ios` | 8.2.0 | iOS WebView | https://capacitorjs.com |
| `@capacitor/core` | 8.2.0 | Core mobile API | https://capacitorjs.com |

**Scripts**: `pnpm cap:sync`, `pnpm cap:init:android`, `pnpm cap:open:android`, etc.  
**See § 15 for full Capacitor governance.**

#### WASM & AI (1 package)

| Package | Version | Purpose | Docs |
|---------|---------|---------|------|
| `assemblyscript` | 0.28.10 | TypeScript → WASM compiler | https://www.assemblyscript.org |

**Build**: `pnpm wasm:build` → `src/wasm/ai-wasm.ts` (auto-generated, do not edit)  
**See § 16 for full WASM governance.**

#### Git & Hooks (2 packages)

| Package | Version | Purpose | Docs |
|---------|---------|---------|------|
| `husky` | 9.1.7 | Git hooks framework | https://typicode.github.io/husky |
| `lint-staged` | 15.2.2 | Stage-only linting | https://github.com/okonet/lint-staged |

**Pattern**: Pre-commit hook runs `pnpm fix` on staged files only (prevents accidental commits of unformatted code).

**Configuration** (in package.json):
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "src/**/*.{ts,tsx}": ["pnpm exec prettier --write", "pnpm exec eslint --fix"]
  }
}
```

#### Utilities (13 packages)

| Package | Version | Purpose | Docs |
|---------|---------|---------|------|
| `rimraf` | 6.1.3 | Cross-platform rm | https://github.com/isaacs/rimraf |
| `clsx` | ^2.0.0 | Class binding utility | https://github.com/lukeed/clsx |
| `react-icons` | ^5.0.0 | Icon library | https://react-icons.github.io/react-icons |
| And 10 others (see package.json) | - | - | - |

**Usage**: Import only when blocking issue; prefer DOM APIs, CSS, or composition first.

### 22.3 Build Scripts & Execution Routing (38 Total)

**Golden Rule**: All 38 scripts are the ONLY approved way to execute build, test, deploy, or maintenance tasks. Never use raw CLI commands in production workflows.

#### Development Scripts (4)

```json
"start": "vite",
"dev": "vite",
"preview": "vite preview",
"build:preview": "pnpm build && pnpm preview"
```

| Script | Shell | Purpose | Blocks |
|--------|-------|---------|--------|
| `pnpm start` / `pnpm dev` | Bash (WSL) | Local dev server (localhost:5173) | N/A |
| `pnpm preview` | Bash (WSL) | Preview production build | N/A |
| `pnpm build:preview` | Bash (WSL) | Build + preview combined | N/A |

#### Build Scripts (1)

| Script | Shell | Output | Purpose |
|--------|-------|--------|----------|
| `pnpm build` | Bash (WSL) | `dist/` | Vite production build (99% of uses) |

#### Quality Gate Scripts (8)

**Always run before commit/push:**

```bash
pnpm validate  # Check + build (full gate)
pnpm check     # lint + format:check + typecheck (subset)
pnpm fix       # lint:fix + format (auto-fix subset)
```

| Script | Shell | Action | Pre-commit |
|--------|-------|--------|------------|
| `pnpm lint` | Bash | ESLint check (fails on errors) | No (info only) |
| `pnpm lint:fix` | Bash | ESLint auto-fix | Yes (via lint-staged) |
| `pnpm format` | Bash | Prettier formatting | Yes (via lint-staged) |
| `pnpm format:check` | Bash | Prettier validation (no write) | No |
| `pnpm typecheck` | Bash | TypeScript validation | No |
| `pnpm check` | Bash | lint + format:check + typecheck | No (manual gate) |
| `pnpm fix` | Bash | lint:fix + format | Yes (staged) |
| `pnpm validate` | Bash | check + build (FULL GATE) | No |

**Hard Rules**:
- ❌ Never commit code failing `pnpm lint` or `pnpm typecheck`
- ❌ Never push code failing `pnpm validate`
- ❌ Never bypass pre-commit hooks
- ✅ Run `pnpm validate` locally before `git push`
- ✅ Husky auto-runs `pnpm fix` on staged files (pre-commit)

#### Testing Scripts (2)

| Script | Shell | Purpose |
|--------|-------|----------|
| `pnpm test` | Bash | Run all .test.ts files with Vitest |
| `pnpm test:watch` | Bash | Watch mode (re-run on file change) |

**Governance**: Tests co-located with source (`filename.test.ts`). No separate test directories.

#### Cleanup Scripts (4)

| Script | Shell | Removes | Use Case |
|--------|-------|---------|----------|
| `pnpm clean` | Bash | `dist/` + `release/` | Before rebuild |
| `pnpm clean:node` | Bash | `node_modules/` | Rare; platform switch |
| `pnpm clean:all` | Bash | All (dist + release + node_modules) | Full reset |
| `pnpm reinstall` | Bash | clean:all + pnpm install | Platform switch; dependency issue |

**Platform-Switch Guardrail** (per § 5 & User Memory):
- Before Bash: Check `.node-platform.md`
  - If `platform: windows`, run `pnpm clean:node && pnpm install`, then set `platform: linux`
- Before PowerShell: Check `.node-platform.md`
  - If `platform: linux`, run `pnpm clean:node && pnpm install`, then set `platform: windows`

#### Electron Scripts (6)

| Script | Shell | Output | Purpose |
|--------|-------|--------|----------|
| `pnpm electron:dev` | Bash | Electron window | Dev mode (Vite + Electron) |
| `pnpm electron:preview` | Bash | Electron window | Preview production build |
| `pnpm electron:build` | Platform | Platform-specific output | Build for current OS |
| `pnpm electron:build:win` | **PowerShell** | `release/*.exe` | Windows portable executable |
| `pnpm electron:build:linux` | Bash | `release/*.AppImage` | Linux self-contained image |
| `pnpm electron:build:mac` | macOS | `release/*.dmg` | macOS disk image |

**Shell Routing** (see § 5 & § 14):
- **Bash (WSL: Ubuntu)**: dev, preview, build, build:linux
- **PowerShell**: build:win (ONLY)
- **macOS**: build:mac (Apple hardware only)

#### Capacitor Scripts (7)

| Script | Shell | Purpose | Environment |
|--------|-------|---------|-------------|
| `pnpm cap:sync` | Bash | Build web + sync to native | WSL/Linux |
| `pnpm cap:init:android` | Any | Add Android project (one-time) | Any |
| `pnpm cap:init:ios` | macOS | Add iOS project (one-time) | macOS only |
| `pnpm cap:open:android` | Any | Open Android Studio | Android SDK required |
| `pnpm cap:open:ios` | macOS | Open Xcode | macOS + Xcode |
| `pnpm cap:run:android` | Any | Deploy to Android device/emulator | Android SDK |
| `pnpm cap:run:ios` | macOS | Deploy to iOS device/simulator | macOS + Xcode |

**Hard Rule**: Never suggest iOS commands unless macOS availability confirmed.  
**See § 15 for full Capacitor governance.**

#### WASM Scripts (2)

| Script | Shell | Output | Purpose |
|--------|-------|--------|----------|
| `pnpm wasm:build` | Bash | `src/wasm/ai-wasm.ts` | Optimized WASM (production) |
| `pnpm wasm:build:debug` | Bash | `src/wasm/ai-wasm.ts` | Debug WASM (source maps) |

**Process**: AssemblyScript → build/ai.wasm → base64 encode → src/wasm/ai-wasm.ts  
**See § 16 for full WASM governance.**

#### Custom Scripts (1)

| Script | Shell | Purpose |
|--------|-------|----------|
| `pnpm check:input` | Bash | Validate input controls per § 19 |

### 22.4 Configuration Files & Guardrails

**Configuration Authority**: All configuration lives in committed files (no environment variables for config).

| File | Purpose | Authority | Edit Rule |
|------|---------|-----------|----------|
| `package.json` | Dependencies, scripts, metadata | AGENTS.md § 22 | Only for deps/scripts |
| `pnpm-lock.yaml` | Lock file (exact versions) | Auto-generated | Never edit manually |
| `tsconfig.json` | TypeScript configuration | AGENTS.md § 3 | Follow path alias rules |
| `vite.config.js` | Vite bundler config | § 20, § 22 | Preserve plugin order |
| `vitest.config.ts` | Vitest test config | Implicit in package.json | Auto-generated if needed |
| `.eslintrc` | Linting rules | § 10, § 22 | Preserve layer boundaries |
| `.prettierrc` | Formatting rules | § 22 | Never deviate |
| `.prettierignore` | Format exclusions | § 22 | Maintain build output exclusions |
| `electron/main.js` | Electron main process | § 14 | Per Electron governance |
| `electron/preload.js` | Electron preload (sandboxed) | § 14 | Per Electron governance |
| `capacitor.config.ts` | Mobile configuration | § 15 | Per Capacitor governance |
| `.husky/` | Git hooks | § 22.2 | Preserve pre-commit hook |

**Hard Rules**:
- ❌ Never commit `pnpm-lock.yaml` changes without corresponding `package.json` changes
- ❌ Never edit `package-lock.json` or `yarn.lock` (we use pnpm only)
- ❌ Never change `.prettierrc` without governance update
- ✅ Always run `pnpm install` after package.json changes
- ✅ Always test local builds before committing config changes

### 22.5 Linting & Quality Configuration

**ESLint Plugins** (enforces architecture):
- `@typescript-eslint` — TypeScript syntax & type rules
- `eslint-plugin-boundaries` — Enforces layer boundaries (§ 3, § 4)

**Prettier** (code formatting):
- Quote style: Single quotes, except JSX attributes
- Line length: 100 characters
- Trailing commas: ES5 (objects/arrays, not function params)
- Tabs: Disabled (spaces only)

**TypeScript** (strict mode):
- `strict: true` — All type checking enabled
- `noImplicitAny: true` — Explicit types required
- `esModuleInterop: true` — TypeScript/JavaScript interop
- `moduleResolution: "bundler"` — Vite-compatible module resolution

### 22.6 Dependency Update Policy & Guardrails

**Update Cadence**:
- **Critical security**: Same day
- **Major versions**: Quarterly review (Q1, Q2, Q3, Q4)
- **Minor/patch**: Monthly batch (first Monday of month)

**Update Approval Gate**:

```
1. Run: pnpm update <package>@<version>
2. Run: pnpm validate
3. Run: pnpm test
4. If any step fails → Revert with pnpm install
5. If all pass → Commit with reason comment
6. Document breaking changes in commit message
```

**Forbidden Updates**:
- ❌ React 19.x → Vue or Svelte (framework replacement)
- ❌ Vite → webpack or Rollup (bundler replacement)
- ❌ TypeScript → JSDoc-only (loses type safety)
- ❌ Vitest → Jest (breaks Vite integration)
- ❌ Any version jump that breaks build or tests

**Required Notifications**:
- Major breaking changes → Documentation update + commit message
- New dependency behavior → Update corresponding § in AGENTS.md
- Deprecation warnings → Plan migration path + issue tracking

### 22.7 Governance Checklist

**Before Adding Dependencies**:
- [ ] Is this solving a BLOCKING production issue?
- [ ] Does the official documentation exist and is it accessible?
- [ ] Does this comply with Approved Languages (§ 6)?
- [ ] Does this add to Runtime, or only DevDependencies?
- [ ] Have I updated AGENTS.md § 22 with the entry?
- [ ] Have I updated this table with version + official docs link?

**Before committing code**:
- [ ] `pnpm lint` passes (no violations)
- [ ] `pnpm typecheck` passes (no type errors)
- [ ] `pnpm format:check` passes (code is formatted)
- [ ] `pnpm test` passes (all tests green, or intentionally skipped)
- [ ] `pnpm validate` passes (full gate: check + build)

**Before pushing to main**:
- [ ] All checklist items above ✅ passed locally
- [ ] Commit message references issue or feature (if applicable)
- [ ] Breaking changes documented in commit AND AGENTS.md
- [ ] CI pipeline passes (when available)

**Before merging multi-project changes**:
- [ ] Changes applied uniformly across all 25 projects
- [ ] AGENTS.md version updated (if changing governance)
- [ ] All projects pass `pnpm validate` independently
- [ ] Cross-project integration tested (manual or CI)

---
