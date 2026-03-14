# Copilot Runtime Policy — Nim

> **Authority**: This file is subordinate to `AGENTS.md`. If any rule here conflicts, `AGENTS.md` wins.

Default development shell for this repository: **Bash (WSL Ubuntu)**.

Do not default to PowerShell unless the task is specifically a Windows packaging workflow such as `electron:build:win`.

---

## Package Manager

**pnpm only.** Never use npm, npx, yarn, or generate non-pnpm lockfiles.

---

## Architecture (CLEAN + Atomic Design)

| Layer | Path | May Import |
|---|---|---|
| Domain | `src/domain/` | `domain/` only |
| App | `src/app/` | `domain/`, `app/` |
| UI | `src/ui/` | `domain/`, `app/`, `ui/` |
| Workers | `src/workers/` | `domain/` only |
| Themes | `src/themes/` | nothing (pure CSS) |

**Component hierarchy**: `atoms/ → molecules/ → organisms/`
**Data flow**: Hooks → Organism → Molecules → Atoms (unidirectional)

---

## Import Rules

- Use path aliases: `@/domain/...`, `@/app/...`, `@/ui/...`.
- Import from barrel `index.ts` files, not internal modules.
- Never use `../../` cross-layer relative imports.

---

## Key Scripts

| Task | Script |
|---|---|
| Dev server | `pnpm start` or `pnpm dev` |
| Build | `pnpm build` |
| Quality gate | `pnpm check` (lint + format:check + typecheck) |
| Auto-fix | `pnpm fix` (lint:fix + format) |
| Full validation | `pnpm validate` (check + build) |
| Clean | `pnpm clean` / `pnpm clean:node` / `pnpm clean:all` / `pnpm reinstall` |

---

## Responsive Design (5-Tier Architecture)

All UI components support 5 semantic device tiers using centralized `useResponsiveState()` hook.

**Device Tiers:**
- **Mobile** (xs/sm: <600px) — phones, compact layout
- **Tablet** (md: 600–899px) — tablets, balanced layout
- **Desktop** (lg: 900–1199px) — laptops, full layout
- **Widescreen** (xl: 1200–1799px) — large monitors, spacious layout
- **Ultrawide** (xxl: 1800px+) — multi-monitor, premium refinement

**Pattern:**
- Extract responsive state: `const responsive = useResponsiveState()`
- Use inline styles for dynamic layout changes (flexDirection, maxWidth, padding based on contentDensity)
- Use CSS media queries for static typography and spacing variants per tier
- Always provide touch fallback: `@media (pointer: coarse) { .button:hover { transform: none; } }`
- Apply content density awareness to spacing: compact/comfortable/spacious

**References:**
- Detailed patterns: `.github/instructions/06-responsive.instructions.md`
- Governance rules: `AGENTS.md` § 12

---

## Menu & Settings Architecture

Applications implement a **dual-menu system**: in-app hamburger (quick access) + full-screen modal (comprehensive).

**Hamburger Menu Pattern:**
- Portal-rendered dropdown (`createPortal()` to `document.body`)
- Fixed positioning at z-index 9999+ (above game)
- Position calculated from button bounding rect via `useLayoutEffect`
- Smart alignment: right-edge aligns to game board with overflow clamping
- Dropdown behavior via `useDropdownBehavior` hook (ESC closes, click-outside closes, focus trap)
- Hamburger icon animates 3-line → X (spring cubic-bezier, 300ms)
- Accessibility: aria-haspopup, aria-expanded, aria-controls, aria-label
- Touch-safe: mousedown + touchstart listeners, no accidental gameplay triggers
- Responsive sizing: 240px (mobile) → 320–480px (desktop) → 380–520px (ultrawide)
- Content density aware: padding/gap scale with `responsive.contentDensity` enum
- Keyboard nav: ESC closes, focus returns to button, tab-trapped while open

**Full-Screen Settings Modal:**
- Triggered from home screen (MainMenu), not during gameplay
- Organized sections: game settings, theme/display, accessibility
- Uses same atoms as hamburger for consistency
- All context providers integrated (ThemeContext, SoundContext, etc.)
- Transactional semantics: OK confirms, Cancel reverts
- Scrollable on mobile if needed
- Accessible form fields with proper labeling

**Related Governance:** `AGENTS.md` § 13 — Menu & Settings Architecture Governance features comprehensive specifications, implementation patterns, and checklists.

---
---

## Shell Routing

Default to **Bash (WSL: Ubuntu)** for all development work.

Use **PowerShell** only for: `pnpm run electron:build:win`
Use **macOS** only for: `pnpm run electron:build:mac`, iOS Capacitor tasks
Use **Android SDK** only for: Android Capacitor tasks

---

## Governance Authority & References

All runtime decisions are subordinate to **AGENTS.md**. Refer to AGENTS.md for comprehensive governance including:

- **§ 4**: Path Discipline & Structure — 15 top-level directories, barrel pattern, file naming conventions, anti-patterns, scaling guidance
- **§ 10**: SOLID Principles & Design Patterns — Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion, DRY, SOC, ACID, CRUD, POLP, RBS; patterns, checklists
- **§ 11**: Standard Application Shell Architecture — splash, landing, main content, results/history screens
- **§ 12**: Responsive Design & Device-Aware UI Governance — 5-tier semantics, content density, touch optimization
- **§ 13**: Menu & Settings Architecture Governance — hamburger menu, full-screen settings modal, dual-menu system, useDropdownBehavior hook, portal rendering, TicTacToe reference implementation
- **§ 14**: Electron & Desktop Build Governance — electron/main.js, preload.js, platform targets, key dependencies
- **§ 15**: Capacitor & Mobile Build Governance — iOS/Android scripts, environment routing, key dependencies
- **§ 16**: WASM & AI Engine Governance — AssemblyScript, build pipeline, worker integration, anti-orphan-script policy
- **§ 17**: Responsive Design & Mobile-First Patterns — 5-tier device architecture, CSS media queries, content density
- **§ 18**: Scale-Aware AI Orchestration — three-tier decision tree, implementation structure, performance targets
- **§ 19**: Input Controls & Action-Based Architecture — semantic actions, context-aware behavior, platform-specific requirements
- **§ 20**: Build & Deployment Governance — script routing, output directories, cleanup, quality gates
- **§ 21**: Detailed Project Structure & File Organization Governance — UI atomic design hierarchy (atoms/molecules/organisms), app layer organization, domain layer patterns, component file size, import validation, asset organization, type definitions, testing organization, checklists
- **§ 22**: Project Build & Dependency Governance — 4 runtime deps, 34 dev deps (organized by category with official docs), 38 build scripts with shell routing, configuration file rules, linting/quality config, dependency update policy, guardrails

---

## Language Guardrails

Approved languages: HTML, CSS, JavaScript, TypeScript, AssemblyScript, WebAssembly.
Do not introduce orphaned helper scripts or alternate runtimes.

---

## Behavioral Rules

1. **Minimal change** — modify only what was requested.
2. **Preserve style** — match existing conventions.
3. **Cite governance** — name the rule and suggest alternatives.
4. **No new top-level directories** without explicit instruction.
5. **Use existing scripts** from `package.json` before inventing CLI commands.

## Project Identity Rule

- Preserve project identity. Never rename the project or product to a framework, runtime, or tool name; treat that as forbidden.

## Input & UI Consistency

- Use shared keyboard controller hooks in `src/app` rather than per-component keydown listeners.
- Maintain standard application shell surfaces (splash, landing, main content, results/history) as detailed in `AGENTS.md` § 11.

## Input Controls Directive (Mandatory)

- All input work must follow `.github/instructions/08-input-controls.instructions.md`.
- Input implementations must remain semantic-action-driven, platform-aware, text-input-safe, and TV-focus-compliant.
- `useKeyboardControls` is a keyboard adapter only; broader orchestration belongs in higher-level app hooks.

## Self-Check Checklist (Before Every Task)

- [ ] Am I using `pnpm` (not npm/npx/yarn)?
- [ ] Does my import respect layer boundaries in Architecture section?
- [ ] Am I using path aliases, not relative cross-layer imports?
- [ ] Am I targeting the correct shell per Shell Routing?
- [ ] Am I using an approved language per Language Guardrails?
- [ ] Am I avoiding orphaned scripts?
- [ ] Am I modifying only what was requested?
- [ ] Does my output match an existing `package.json` script where applicable?

## Input Controls Agent Checklist

- [ ] Use semantic actions as the primary integration surface.
- [ ] Preserve text-input safety and chat/input focus behavior.
- [ ] Keep `useKeyboardControls` as an adapter, not orchestration.
- [ ] Ensure mappings remain unsurprising across Desktop/Web/Mobile/TV.
