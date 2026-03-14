# Build & Packaging Instructions

> **Scope**: Build scripts, packaging, shell/environment routing, output directories.
> Subordinate to `AGENTS.md` §2 (pnpm-only) and §5 (shell routing).

---

## Script Routing Matrix

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

---

## Shell / Environment Routing

| Environment | Tasks |
|---|---|
| **Bash (WSL: Ubuntu)** | `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm check`, `pnpm fix`, `pnpm validate`, `pnpm electron:build:linux`, `pnpm cap:sync`, `pnpm wasm:build` |
| **PowerShell** | `pnpm electron:build:win` only |
| **macOS / Apple** | `pnpm electron:build:mac`, `pnpm cap:open:ios`, `pnpm cap:run:ios` |

**Default**: Bash (WSL: Ubuntu) for everything unless the task explicitly targets Windows packaging or Apple platforms.

---

## Electron Builder Configuration

Defined in `package.json` under the `"build"` key:

| Field | Value |
|---|---|
| `appId` | `com.scottreinhart.nim` |
| `productName` | `Nim` |
| `directories.output` | `release` |
| `files` | `dist/**/*`, `electron/**/*` |
| `win.target` | `portable` (unsigned) |
| `mac.target` | `dmg` |
| `linux.target` | `AppImage` |

---

## Output Directories

| Directory | Contents | Gitignored |
|---|---|---|
| `dist/` | Vite production build output | Yes |
| `release/` | Electron Builder distributables | Yes |
| `node_modules/` | Dependencies | Yes |

---

## Cleanup Scripts

| Script | Effect |
|---|---|
| `pnpm clean` | Removes `dist/` and `release/` |
| `pnpm clean:node` | Removes `node_modules/` |
| `pnpm clean:all` | Removes `dist/`, `release/`, and `node_modules/` |
| `pnpm reinstall` | `clean:all` + `pnpm install` |

---

## Quality Gate Scripts

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

---

## Language Guardrails

Build scripts use **JavaScript** (Node) in `scripts/`. Do not introduce Python, Bash, PowerShell, or other side-language build helpers.
Prefer existing `package.json` scripts over raw CLI commands.
Do not create parallel build paths or duplicate tooling.
