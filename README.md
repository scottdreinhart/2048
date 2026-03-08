# 2048

Slide numbered tiles on a 4x4 grid; merge matching tiles to reach 2048

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — type-safe development
- **Vite 7** — build tool & dev server
- **Electron** — desktop app (Windows, macOS, Linux)
- **Capacitor** — mobile app (Android, iOS)
- **ESLint + Prettier** — code quality & formatting

## Getting Started

```bash
pnpm install
pnpm dev          # Start dev server at http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm validate` | Full lint + format + typecheck + build |
| `pnpm electron:dev` | Run as Electron desktop app |
| `pnpm electron:build` | Build Electron distributables |
| `pnpm cap:sync` | Build & sync to Capacitor (mobile) |

## License

Proprietary — © 2026 Scott Reinhart
