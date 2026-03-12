# 🔢 2048

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://github.com/facebook/react)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://github.com/vitejs/vite)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://github.com/microsoft/TypeScript)
[![AssemblyScript](https://img.shields.io/badge/AssemblyScript-0.28-007AAC?logo=assemblyscript&logoColor=white)](https://github.com/AssemblyScript/assemblyscript)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-AI_Engine-654FF0?logo=webassembly&logoColor=white)](https://webassembly.org/)
[![CSS Modules](https://img.shields.io/badge/CSS_Modules-scoped-1572B6?logo=cssmodules&logoColor=white)](https://github.com/css-modules/css-modules)
[![Electron](https://img.shields.io/badge/Electron-40-47848F?logo=electron&logoColor=white)](https://github.com/electron/electron)
[![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor&logoColor=white)](https://github.com/ionic-team/capacitor)
[![Node.js](https://img.shields.io/badge/Node.js-24-5FA04E?logo=nodedotjs&logoColor=white)](https://github.com/nodejs/node)
[![pnpm](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm&logoColor=white)](https://github.com/pnpm/pnpm)
[![ESLint](https://img.shields.io/badge/ESLint-10-4B32C3?logo=eslint&logoColor=white)](https://github.com/eslint/eslint)
[![Prettier](https://img.shields.io/badge/Prettier-3-F7B93E?logo=prettier&logoColor=black)](https://github.com/prettier/prettier)
[![All Rights Reserved](https://img.shields.io/badge/License-All%20Rights%20Reserved-red.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-scottdreinhart%2F2048-181717?logo=github&logoColor=white)](https://github.com/scottdreinhart/2048)

Slide numbered tiles on a 4×4 grid; merge matching tiles to reach 2048

**⚠️ PROPRIETARY SOFTWARE — All Rights Reserved**

© 2026 Scott Reinhart. This software is proprietary and confidential.
Unauthorized reproduction, distribution, or use is strictly prohibited.
See [LICENSE](LICENSE) file for complete terms and conditions.

> [!CAUTION]
> **LICENSE TRANSITION PLANNED** — This project is currently proprietary. The license will change to open source once the project has reached a suitable state to allow for it.

[Project Structure](#project-structure) · [Getting Started](#getting-started) · [Tech Stack](#tech-stack) · [Contributing](#contributing) · [Future Improvements](#future-improvements) · [Portfolio Services](#portfolio-services) · [Future Game Ideas](#future-game-ideas)

## Project Structure

```
src/
├── domain/                           # Pure, framework-agnostic logic
│   ├── types.ts                      # Central type definitions
│   ├── constants.ts                  # Game constants
│   ├── board.ts                      # Board operations
│   ├── rules.ts                      # Game rules & win/loss detection
│   ├── ai.ts                         # CPU move selection algorithms
│   ├── themes.ts                     # Color theme, mode & colorblind definitions
│   ├── layers.ts                     # LayerManager — visual layer stack config (opacity, blend, visibility)
│   ├── sprites.ts                    # SpriteManager — centralized sprite/asset registry per theme
│   └── index.ts                      # Barrel export — re-exports all domain modules
├── app/
│   ├── haptics.ts                    # Vibration API wrapper (tick, tap, heavy)
│   ├── sounds.ts                     # Web Audio API synthesized SFX
│   ├── storageService.ts             # localStorage JSON wrapper (load<T>/save/remove)
│   ├── ThemeContext.tsx              # React Context provider for theme/mode/colorblind settings
│   ├── SoundContext.tsx              # React Context provider for sound state + guarded playback
│   ├── useTheme.ts                   # Theme / mode / colorblind persistence + DOM sync
│   ├── useSoundEffects.ts            # Sound toggle + play functions (respects reduced-motion)
│   ├── use*.ts                       # Additional React hooks for state & effects
│   └── index.ts                      # Barrel export — re-exports all app hooks and services
├── ui/
│   ├── atoms/
│   │   ├── ErrorBoundary.tsx         # React Error Boundary — crash isolation with fallback + retry
│   │   └── index.ts                  # Barrel export — re-exports all atoms
│   ├── molecules/
│   │   └── index.ts                  # Barrel export — re-exports all molecules
│   ├── organisms/
│   │   ├── App.tsx                   # Top-level game component (pure composition)
│   │   └── index.ts                  # Barrel export — re-exports all organisms
│   ├── index.ts                      # Barrel export — re-exports all UI sub-layers
│   ├── ui-constants.ts               # UI layout constants (sizes, breakpoints)
│   └── utils/
│       ├── cssModules.ts             # cx() conditional class binding utility
│       └── index.ts                  # Barrel export — re-exports utilities
├── themes/                           # Lazy-loaded theme CSS chunks
│   ├── highcontrast.css              # High-contrast theme (default)
│   ├── ocean.css / sunset.css        # Additional color themes
│   ├── forest.css / rose.css
│   └── midnight.css
├── wasm/
│   └── ai-wasm.ts                    # WASM AI engine loader + fallback
├── workers/
│   └── ai.worker.ts                  # Off-main-thread AI computation
├── index.tsx                         # React entry point (ThemeProvider > SoundProvider > ErrorBoundary > App)
└── styles.css                        # Global styles & CSS custom properties

public/
├── manifest.json                     # PWA manifest
├── sw.js                             # Service worker for offline play
└── offline.html                      # Offline fallback page

index.html                            # HTML entry point
package.json                          # Dependencies & scripts
pnpm-lock.yaml                        # pnpm lockfile
pnpm-workspace.yaml                   # pnpm workspace config
LICENSE                               # Proprietary license terms
capacitor.config.ts                   # Capacitor native app configuration
electron/
├── main.js                           # Electron main process
└── preload.js                        # Sandboxed context bridge

tsconfig.json                         # TypeScript config (strict mode + @/ path aliases)
vite.config.js                        # Vite config + rollup-plugin-visualizer + @/ resolve aliases
eslint.config.js                      # ESLint flat config (React + hooks + Prettier + boundary enforcement)
assembly/
├── tsconfig.json                      # AssemblyScript compiler config
└── index.ts                          # WASM AI entry point (game-specific stub)
scripts/
└── build-wasm.js                     # WASM build script (AssemblyScript → .wasm → base64)
.gitattributes                        # Line endings, binary rules, Linguist overrides
.env.nocache                          # VITE_NOCACHE flag for cache-busting during development
.npmrc                                # pnpm config (save-exact, auto-install-peers)
.prettierrc                           # Prettier formatting rules
.gitignore                            # Git ignore rules
.nvmrc                                # Node.js version pin (v24)
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v24+ (pin via [nvm](https://github.com/nvm-sh/nvm) — see `.nvmrc`)
- [pnpm](https://pnpm.io/) v10+

### Install & Run

```bash
# Install dependencies
pnpm install

# Start development server (accessible on LAN via 0.0.0.0)
pnpm start          # quick alias — vite --host
pnpm dev            # same + kills stale port 5173 first

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Build then preview in one step
pnpm build:preview
```

### Code Quality

```bash
# Individual tools
pnpm lint           # ESLint — check for issues
pnpm eslint:fix     # ESLint — auto-fix issues
pnpm prettier:fix   # Prettier — format all source files
pnpm format:check   # Prettier — check formatting without writing
pnpm typecheck      # TypeScript type check (tsc --noEmit)

# Chains
pnpm check          # lint + format:check + typecheck in one pass (quality gate)
pnpm fix            # eslint:fix + prettier:fix in one pass (auto-fix everything)
pnpm validate       # check + build — full pre-push validation
```
## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://github.com/facebook/react) | 19 | UI library (hooks, memo, lazy) |
| [TypeScript](https://github.com/microsoft/TypeScript) | 5.9 | Static type checking (strict mode) |
| [Vite](https://github.com/vitejs/vite) | 7 | Build tool & dev server |
| [Electron](https://github.com/electron/electron) | 40 | Desktop app (Windows / Linux / macOS) |
| [Capacitor](https://github.com/ionic-team/capacitor) | 8 | Native mobile / tablet apps (Android / iOS) |
| [electron-builder](https://github.com/electron-userland/electron-builder) | 26 | Desktop packaging & installers |
| [CSS Modules](https://github.com/css-modules/css-modules) | — | Scoped component styling |
| [ESLint](https://github.com/eslint/eslint) | 10 | Linting (flat config, React + hooks plugins) |
| [Prettier](https://github.com/prettier/prettier) | 3 | Code formatting |
| [pnpm](https://github.com/pnpm/pnpm) | 10 | Fast, disk-efficient package manager |
| [Node.js](https://github.com/nodejs/node) | 24 | Runtime (pinned via `.nvmrc`) |

## Architecture

This project enforces nine complementary design principles:

1. **CLEAN Architecture** (Layer Separation)
   - `domain/` layer: Pure, framework-agnostic logic (zero React dependencies)
   - `app/` layer: React hooks for state management & side effects
   - `ui/` layer: Presentational components (atoms → molecules → organisms)
   - **Benefit**: Domain logic is testable, reusable, and framework-independent

2. **Atomic Design** (Component Hierarchy)
   - Data flows unidirectionally: **Hooks → Organism → Molecules → Atoms**
   - Organisms contain zero inline markup; all composition happens in JSX
   - **Benefit**: Components are predictable, composable, and reusable across contexts

3. **SOLID Principles** (Code-Level Design)
   - Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
   - **Benefit**: Code is maintainable, testable, and resistant to side effects

4. **DRY Principle** (No Duplication)
   - Constants extracted to single sources; reusable hooks eliminate component duplication
   - **Benefit**: Changes propagate consistently; less code to maintain

5. **Import Boundary Enforcement** (`eslint-plugin-boundaries`)
   - `domain/` → may only import from `domain/` (zero framework deps)
   - `app/` → may import `domain/` + `app/` (never `ui/`)
   - `ui/` → may import `domain/`, `app/`, and `ui/` (full downstream access)
   - `workers/` → may only import `domain/` (pure computation)
   - `themes/` → may not import anything (pure CSS data)
   - **Benefit**: CLEAN layer violations are caught at lint time, not at code review

6. **Path Aliases** (`@/domain`, `@/app`, `@/ui`)
   - Configured in `tsconfig.json` (`paths`) and `vite.config.js` (`resolve.alias`)
   - Eliminates fragile `../../` relative imports across layers
   - **Benefit**: Imports are self-documenting (`@/domain/rules` vs `../../domain/rules`) and resilient to file moves

7. **Barrel Exports** (`index.ts` per directory)
   - Each layer exposes a single public API via its barrel file
   - Internal module structure can change without breaking consumers
   - **Benefit**: Explicit public APIs; refactoring internals doesn't cascade import changes

8. **React Error Boundaries** (Crash Isolation)
   - `ErrorBoundary` component wraps the game at the organism level
   - Catches render errors and displays a themed fallback UI with a retry button
   - Prevents a single component crash from taking down the entire app
   - **Benefit**: Graceful degradation — users see an actionable error, not a white screen

9. **React Context for Dependency Injection** (ThemeProvider + SoundProvider)
   - `ThemeProvider` provides theme state to the entire tree via React Context
   - `SoundProvider` provides sound state + guarded play functions via React Context
   - Both wired at the root in `index.tsx`: `ThemeProvider > SoundProvider > ErrorBoundary > App`
   - **Benefit**: Any component can access theme or sound state without prop drilling

## Device Compatibility

| Platform | Native App Tech | Distribution | Input Method | Web | Native App |
|---|---|---|---|:---:|:---:|
| **Desktop** | | | | | |
| Windows | Electron | `.exe` / Microsoft Store | Mouse, keyboard, trackpad | ✅ | ✅ |
| macOS | Electron | `.dmg` / Mac App Store | Mouse, keyboard, trackpad | ✅ | ✅ |
| Linux | Electron | `.AppImage` / `.deb` / `.snap` | Mouse, keyboard, trackpad | ✅ | ✅ |
| **Mobile** | | | | | |
| Android | Capacitor | Google Play Store / `.apk` | Touch, swipe gestures | ✅ | ✅ |
| iOS | Capacitor | App Store | Touch, swipe gestures | ✅ | ✅ |
| **Tablets** | | | | | |
| iPad | Capacitor (iOS) | App Store | Touch, swipe gestures | ✅ | ✅ |
| Android tablets | Capacitor (Android) | Google Play Store | Touch, swipe gestures | ✅ | ✅ |
| Amazon Fire tablets | Capacitor (Android) | Amazon Appstore | Touch, swipe gestures | ✅ | ✅ |

## Remaining Work

### Visual & UX

- [ ] **Game UI implementation** — build the complete game interface with animations and effects
- [ ] **Theme system** — multiple color themes with light/dark/system mode + colorblind presets
- [ ] **Sound effects** — Web Audio API synthesized SFX + background music

### Code Quality

```bash
# Individual tools
pnpm lint           # ESLint — check for issues
pnpm eslint:fix     # ESLint — auto-fix issues
pnpm prettier:fix   # Prettier — format all source files
pnpm format:check   # Prettier — check formatting without writing
pnpm typecheck      # TypeScript type check (tsc --noEmit)

# Chains
pnpm check          # lint + format:check + typecheck in one pass (quality gate)
pnpm fix            # eslint:fix + prettier:fix in one pass (auto-fix everything)
pnpm validate       # check + build — full pre-push validation
```
## Future Improvements

The following monetization and sustainability strategies are under consideration. Each model is designed to preserve the free-to-play core experience while introducing optional revenue streams that fund ongoing development, server infrastructure, and cross-platform maintenance.

### Ad Network Participation

- [ ] **Rewarded video ads** — opt-in ad placements (e.g., Google AdMob, Unity Ads) that grant in-game rewards such as bonus theme previews, temporary cosmetic unlocks, or series score multipliers. Users are never forced to watch — ads are triggered only by explicit interaction ("Watch to unlock").
- [ ] **Interstitial placement** — non-intrusive full-screen ads shown at natural breakpoints (between matches, after a game-over screen) with frequency capping to prevent fatigue. Configurable via remote config so cadence can be tuned post-launch without a client update.
- [ ] **Banner integration** — reserved layout slot for lightweight banner ads on non-gameplay screens (settings, stats dashboard). The game board itself remains permanently ad-free to protect the core UX.

> **Justification:** Ad networks provide a zero-barrier revenue floor — every user contributes regardless of purchase intent. Rewarded ads in particular have shown 2–4× higher eCPMs than banners while maintaining positive user sentiment because the value exchange is transparent and voluntary.

### Monthly Subscription

- [ ] **Premium tier** — a low-cost monthly subscription (~$1.99–$3.99/month) that removes all ads, unlocks the full theme catalog, grants early access to new game modes, and provides subscriber-exclusive cosmetics (animated marks, board skins, victory effects).
- [ ] **Cross-project entitlement** — a single subscription covers all games in the portfolio (Tic-Tac-Toe, Connect Four, Mancala, etc.), increasing perceived value and reducing churn as new titles launch.
- [ ] **Family sharing** — support platform family-sharing mechanisms (Google Play Family Library, Apple Family Sharing) to extend a single subscription across household devices.

> **Justification:** Subscriptions generate predictable, recurring revenue that smooths the volatility of ad markets and one-time purchases. Bundling across the full game portfolio transforms each new title from a separate acquisition cost into a retention tool — subscribers stay engaged as long as fresh content ships.

### Tiered Purchase Model

- [ ] **Free tier** — the complete game with default theme, all difficulty levels, and standard game modes. No gameplay is gated behind a paywall.
- [ ] **Starter pack** (~$0.99) — a one-time purchase that permanently removes banner ads and unlocks 3 additional themes.
- [ ] **Pro pack** (~$2.99) — includes everything in Starter plus all current and future themes, animated marks, custom board textures, and detailed lifetime statistics.
- [ ] **Collector's edition** (~$4.99) — includes everything in Pro plus exclusive seasonal themes, priority access to beta features, and a supporter badge displayed in online multiplayer.

> **Justification:** Tiered pricing captures value across the entire willingness-to-pay spectrum. The free tier maximizes install base and ad impressions; the Starter pack converts casual players at an impulse-buy price point; Pro and Collector's editions extract premium value from engaged users who want completionism and exclusivity. No tier restricts core gameplay — every purchase is cosmetic or convenience-oriented.

### eGoods Purchasing (Themes & Cosmetics)

- [ ] **Individual theme packs** (~$0.49–$0.99 each) — purchase single themes à la carte without committing to a bundle. Ideal for users who want one specific aesthetic without buying a full pack.
- [ ] **Seasonal / limited-edition themes** — time-limited theme drops (holiday palettes, collaborations, community-voted designs) that create urgency and collectibility. Retired themes may return in future rotations.
- [ ] **Mark customization** — purchasable game piece variants: neon glow, hand-drawn sketch, pixel art, emoji, or animated SVG styles. Applied per-player, visible to opponents in online multiplayer.
- [ ] **Board skins** — alternative board grid styles (chalk on slate, wooden inlay, sci-fi hologram, retro arcade) that overlay the default grid lines and cell backgrounds.
- [ ] **Victory effects** — premium win-line and celebration animations (fireworks, sparkle cascade, lightning strike) triggered on game-winning moves.
- [ ] **Sound packs** — alternative synthesized SFX suites (retro 8-bit, orchestral, lo-fi) that replace the default Web Audio API sound set.

> **Justification:** Microtransaction-based eGoods leverage the existing theme architecture — the CSS variable system, lazy-loaded theme chunks, and `useTheme` context already support hot-swapping visual styles at runtime. This makes the marginal engineering cost of each new theme near zero while the perceived user value remains high. Cosmetic-only purchases avoid pay-to-win dynamics and align with platform store guidelines (Apple App Store, Google Play) that discourage gameplay-gating IAPs.
---

## Portfolio Services

Infrastructure services and API backends supporting the game portfolio:

| Service | Type | Description |
| ------- | ---- | ----------- |
| **[💳 Game Billing](https://github.com/scottdreinhart/game-billing)** | Admin App | Payment processing & subscription management |
| **[🎨 Theme Store](https://github.com/scottdreinhart/theme-store)** | Admin App | DLC theme downloader & manager |
| **[📺 Ad Network](https://github.com/scottdreinhart/ad-network)** | Admin App | Ad serving & revenue management |
| **[💳 Billing API](https://github.com/scottdreinhart/billing-api)** | Fastify API | Payment & subscription API backend |
| **[🎨 Themes API](https://github.com/scottdreinhart/themes-api)** | Fastify API | Theme catalog & DLC distribution API backend |
| **[📺 Ads API](https://github.com/scottdreinhart/ads-api)** | Fastify API | Ad serving & impression tracking API backend |
| **[🏆 Rankings API](https://github.com/scottdreinhart/rankings-api)** | Fastify API | King of the Hill multiplayer ranking & leaderboard API backend |

## Future Game Ideas

All games in this portfolio share the same React + Vite + TypeScript + CLEAN architecture stack:

| Game | Description | Complexity |
| ---- | ----------- | ---------- |
| **[Tic-Tac-Toe](https://github.com/scottdreinhart/tictactoe)** | Classic 3×3 grid game with 4 AI difficulty levels and series mode | Baseline — the reference architecture |
| **[Shut the Box](https://github.com/scottdreinhart/shut-the-box)** | Roll dice, flip numbered tiles to match the total; lowest remaining sum wins | Similar — grid UI + dice logic |
| **[Mancala (Kalah)](https://github.com/scottdreinhart/mancala)** | Two-row pit-and-stones capture game; simple rules, satisfying chain moves | Slightly higher — seed-sowing animation |
| **[Connect Four](https://github.com/scottdreinhart/connect-four)** | Drop discs into a 7×6 grid; first to four in a row wins | Similar — larger grid, same win-check pattern |
| **[Simon Says](https://github.com/scottdreinhart/simon-says)** | Repeat a growing sequence of colors/sounds; memory challenge | Similar — leverages existing Web Audio API |
| **[Lights Out](https://github.com/scottdreinhart/lights-out)** | Toggle a 5×5 grid of lights; goal is to turn them all off | Similar — grid + toggle logic |
| **[Nim](https://github.com/scottdreinhart/nim)** | Players take turns removing objects from piles; last to take loses | Simpler — minimal UI, pure strategy |
| **[Hangman](https://github.com/scottdreinhart/hangman)** | Guess letters to reveal a hidden word before the stick figure completes | Similar — alphabet grid + SVG drawing |
| **[Memory / Concentration](https://github.com/scottdreinhart/memory-game)** | Flip cards to find matching pairs on a grid | Similar — grid + flip animation |
| **[2048](https://github.com/scottdreinhart/2048)** | Slide numbered tiles on a 4×4 grid; merge matching tiles to reach 2048 | Slightly higher — swipe input + merge logic |
| **[Reversi (Othello)](https://github.com/scottdreinhart/reversi)** | Place discs to flip opponent's pieces; most discs wins | Moderately higher — flip-chain logic + AI |
| **[Checkers](https://github.com/scottdreinhart/checkers)** | Classic diagonal-move capture board game | Higher — move validation + multi-jump |
| **[Battleship](https://github.com/scottdreinhart/battleship)** | Place ships on a grid, take turns guessing opponent locations | Moderately higher — two-board UI + ship placement |
| **[Snake](https://github.com/scottdreinhart/snake)** | Steer a growing snake to eat food without hitting walls or itself | Different — real-time game loop instead of turn-based |
| **[Monchola](https://github.com/scottdreinhart/monchola)** | Traditional dice/board race game with capture mechanics | Similar — dice roll + board path + capture rules |
| **[Rock Paper Scissors](https://github.com/scottdreinhart/rock-paper-scissors)** | Best-of-N rounds against the CPU with hand animations | Simpler — minimal state, animation-focused |
| **[Minesweeper](https://github.com/scottdreinhart/minesweeper)** | Reveal cells on a minefield grid without detonating hidden mines | Moderately higher — flood-fill reveal + flag logic |
| **[Pig](https://github.com/scottdreinhart/pig)** | A jeopardy dice game where players roll a single die to accumulate points, but lose all points for the turn if they roll a 1 | Simpler — single die, push-your-luck logic |
| **[Farkle](https://github.com/scottdreinhart/farkle)** | A scoring game where players roll six dice to build combinations; failure to score on a roll results in a "farkle" and loss of turn points | Moderately higher — multi-dice combo scoring |
| **[Cee-lo](https://github.com/scottdreinhart/cee-lo)** | A gambling game using three dice where players win by rolling specific combinations like 4-5-6 or triples | Similar — combo detection + round resolution |
| **[Ship, Captain, and Crew](https://github.com/scottdreinhart/ship-captain-crew)** | A fast-paced game where players must roll a 6, 5, and 4 in sequence to qualify their remaining dice for scoring | Similar — sequential lock-in mechanic |
| **[Liar's Dice](https://github.com/scottdreinhart/liars-dice)** | A bluffing game where players bid on the total number of dice of a certain value hidden under all players' cups | Higher — bluff AI + hidden information |
| **[Bunco](https://github.com/scottdreinhart/bunco)** | A social game played in rounds where players earn points by rolling specific numbers matching the current round | Simpler — round-based target matching |
| **[Mexico](https://github.com/scottdreinhart/mexico)** | A simple elimination game where players roll two dice and must match or beat the "leader's" score to stay in the round | Similar — elimination round logic |
| **[Chō-han](https://github.com/scottdreinhart/cho-han)** | A traditional Japanese game where players bet on whether the sum of two hidden dice is even (Chō) or odd (Han) | Simpler — binary bet + reveal animation |
| **[Chicago](https://github.com/scottdreinhart/chicago)** | An 11-round game where players score by rolling a sum that matches the specific target number for that round | Similar — round-target scoring system |

## Contributing

This is proprietary software. Contributions are accepted by invitation only.

If you have been granted contributor access:

1. Create a feature branch from `main`
2. Make focused, single-purpose commits with clear messages
3. Run `pnpm validate` before pushing (lint + format + build gate)
4. Submit a pull request with a description of the change

See the [LICENSE](LICENSE) file for usage restrictions.

## License

Copyright © 2026 Scott Reinhart. All Rights Reserved.

This project is proprietary software. No permission is granted to use, copy, modify, or distribute this software without the prior written consent of the owner. See the [LICENSE](LICENSE) file for full terms.

---

[⬆ Back to top](#-2048)
