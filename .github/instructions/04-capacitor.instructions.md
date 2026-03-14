# Capacitor Instructions

> **Scope**: Capacitor mobile/tablet app development, native platform setup, and deployment.
> Subordinate to `AGENTS.md` §5 (shell routing).

---

## Overview

Capacitor wraps the Vite `dist/` output in native Android and iOS app shells. The web code runs in a native WebView — no code changes are needed between web and mobile builds.

Configuration: `capacitor.config.ts` in the project root.

---

## Scripts

| Script | What It Does |
|---|---|
| `pnpm cap:init:android` | Add Android project (one-time setup) |
| `pnpm cap:init:ios` | Add iOS project (one-time setup) |
| `pnpm cap:sync` | Vite build + sync web assets to native projects |
| `pnpm cap:open:android` | Open in Android Studio |
| `pnpm cap:open:ios` | Open in Xcode |
| `pnpm cap:run:android` | Deploy to Android device/emulator |
| `pnpm cap:run:ios` | Deploy to iOS device/simulator |

All scripts use `pnpm exec cap` (never `npx cap`).

---

## Environment Routing

| Script | Required Environment |
|---|---|
| `pnpm cap:init:android` | Bash (WSL: Ubuntu) or any |
| `pnpm cap:init:ios` | **macOS / Apple** (Xcode required) |
| `pnpm cap:sync` | Bash (WSL: Ubuntu) |
| `pnpm cap:open:android` | Any (requires Android Studio) |
| `pnpm cap:open:ios` | **macOS / Apple** (requires Xcode) |
| `pnpm cap:run:android` | Any (requires Android SDK + connected device/emulator) |
| `pnpm cap:run:ios` | **macOS / Apple** (requires Xcode + iOS device/simulator) |

**iOS builds require Apple hardware.** Never suggest iOS Capacitor commands unless the user has confirmed macOS availability.
Default to Bash for `cap:sync` and general Capacitor setup.

---

## Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@capacitor/core` | 8.2.0 | Runtime (dependency) |
| `@capacitor/android` | 8.2.0 | Android platform (dependency) |
| `@capacitor/cli` | 8.2.0 | CLI tool (devDependency) |

---

## Platform Support

| Platform | Distribution | Input Method |
|---|---|---|
| Android phones | Google Play Store / `.apk` | Touch, swipe gestures |
| Android tablets | Google Play Store | Touch, swipe gestures |
| iPad | App Store | Touch, swipe gestures |
| iPhone | App Store | Touch, swipe gestures |

---

## Workflow

1. Build the web app: `pnpm build`
2. Sync to native projects: `pnpm cap:sync`
3. Open IDE: `pnpm cap:open:android` or `pnpm cap:open:ios`
4. Build and run from the native IDE (Android Studio / Xcode)

---

## Language Guardrails

Capacitor configuration uses **TypeScript** (`capacitor.config.ts`).
Do not introduce orphaned helper scripts or alternate runtimes for Capacitor workflows.
Prefer existing `package.json` scripts and repository-native tooling.
Do not create parallel build paths or duplicate tooling.
