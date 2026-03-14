# UI Pattern Analysis: Hamburger Menu & Settings Screens
## Cross-Repository Study
**Scope**: Game projects across ecosystem  
**Focus**: Reusable patterns for UI enhancement

---

## Executive Summary

**TicTacToe** is the model implementation with a sophisticated, reusable hamburger menu pattern and comprehensive settings architecture. The framework applies uniformly across all game projects in this ecosystem.

**Key Finding**: TicTacToe's `HamburgerMenu` component using React.createPortal() + useDropdownBehavior is the gold standard for in-game menu access. All repos would benefit from this pattern.

**Recommendation**: Adopt TicTacToe's HamburgerMenu for in-game settings access, integrated with full-screen settings modal for comprehensive configuration.

---

## 1. TICTACTOE — Advanced UI Pattern (Gold Standard)

### 1.1 Hamburger Menu Implementation

**File**: `src/ui/molecules/HamburgerMenu.tsx`

#### Component Architecture

```tsx
const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [panelPos, setPanelPos] = useState<PanelPosition | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // 1. Calculate fixed position from button bounding rect
  useLayoutEffect(() => {
    if (!open || !btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const boardEl = document.getElementById('game-board')
    const boardRect = boardEl?.getBoundingClientRect()
      ? boardEl.getBoundingClientRect()
      : { left: 0, right: window.innerWidth }
    
    const panelWidth = 240
    const pad = 8
    // Align panel's right edge to board's right edge
    let left = boardRect.right - panelWidth
    if (left < boardRect.left + pad) {
      left = boardRect.left + pad
    }
    setPanelPos({ top: rect.bottom + 8, left })
  }, [open])

  // 2. Toggle open/closed
  const toggle = useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  // 3. Dropdown behavior: close on outside click, ESC key, focus trap
  useDropdownBehavior({
    open,
    onClose: () => setOpen(false),
    triggerRef: btnRef,
    panelRef,
  })

  return (
    <div className={styles.root}>
      {/* Hamburger button */}
      <button
        ref={btnRef}
        type="button"
        className={styles.button}
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="game-menu-panel"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        <span className={styles.icon} aria-hidden="true">
          <span className={`${styles.line}${open ? ` ${styles.lineOpen}` : ''}`} />
          <span className={`${styles.line}${open ? ` ${styles.lineOpen}` : ''}`} />
          <span className={`${styles.line}${open ? ` ${styles.lineOpen}` : ''}`} />
        </span>
      </button>

      {/* Portal to document.body for layering */}
      {open && createPortal(
        <div
          ref={panelRef}
          id="game-menu-panel"
          className={styles.panel}
          role="menu"
          aria-label="Game settings"
          style={panelPos ? { top: panelPos.top, left: panelPos.left } : undefined}
        >
          {children}
        </div>,
        document.body,
      )}
    </div>
  )
}
```

#### Key Features

| Feature | Implementation |
|---------|----------------|
| **Trigger** | Click hamburger button (3-line icon) |
| **Open State** | Local `useState(false)` |
| **Position** | Calculated via useLayoutEffect from button rect |
| **Portal** | `createPortal(panel, document.body)` |
| **Alignment** | Right-edge aligned to game board |
| **Overflow** | Clamps to left side if panel overflows |
| **Keyboard** | ESC to close, focus trap via useDropdownBehavior |
| **Touch** | Full mousedown + touchstart listener support |

### 1.2 useDropdownBehavior Hook

**File**: `src/app/useDropdownBehavior.ts`

```tsx
const useDropdownBehavior = ({
  open,
  onClose,
  triggerRef,
  panelRef,
  onOutsideClick,
}: DropdownConfig): void => {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return

    // Outside click dismissal
    const handleOutside = (e: Event) => {
      const target = e.target as Node
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        onOutsideClick?.()
        onCloseRef.current()
      }
    }

    // ESC key dismissal
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current()
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, triggerRef, panelRef, onOutsideClick])
}
```

### 1.3 CSS Styling

**File**: `src/ui/molecules/HamburgerMenu.module.css`

```css
/* Button */
.button {
  background: transparent;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  min-width: 48px;
  min-height: 48px;
  transition: background-color 200ms ease, transform 200ms ease;
}

.button:hover {
  background: var(--cell-hover-bg);
  transform: scale(1.05);
}

.button:active {
  transform: scale(0.95);
}

/* Lines transform to X */
.line {
  display: block;
  height: 2.5px;
  width: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: transform 300ms ease, opacity 300ms ease;
}

.lineOpen:nth-child(1) {
  /* Top line rotates 45deg down */
  transform: translateY(6.5px) rotate(45deg);
}

.lineOpen:nth-child(2) {
  /* Middle line fades out */
  opacity: 0;
}

.lineOpen:nth-child(3) {
  /* Bottom line rotates -45deg up */
  transform: translateY(-6.5px) rotate(-45deg);
}

/* Panel entrance animation */
.panel {
  position: fixed;
  z-index: 9999;
  background: var(--card-bg);
  border: 2px solid var(--accent);
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 8px 32px var(--card-shadow);
  min-width: 240px;
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
```

### 1.4 Settings Overlay (Full-Screen Modal)

**File**: `src/ui/molecules/SettingsOverlay.tsx` (excerpt)

```tsx
export function SettingsOverlay({
  difficulty,
  seriesLength,
  soundEnabled,
  onSetDifficulty,
  onSetSeriesLength,
  onToggleSound,
  onBack,
}: SettingsOverlayProps) {
  const { settings, setColorTheme, setMode, setColorblind } = useThemeContext()

  return (
    <div className={styles.overlay}>
      <h1 className={styles.title}>Settings</h1>
      
      <div className={styles.settingsScroll}>
        {/* Difficulty, Series, Sound, Theme, Mode, Colorblind sections */}
      </div>

      <div className={styles.menu}>
        <button className={styles.menuBtnPrimary} onClick={onBack} autoFocus>
          Back
        </button>
      </div>
    </div>
  )
}
```

---

## 2. Pattern Integration Guide

### For Each Game Project:

1. **Create `useDropdownBehavior.ts`** from TicTacToe reference
2. **Create `HamburgerMenu.tsx`** with portal-based rendering
3. **Adapt toggle atoms** (DifficultyToggle, SoundToggle, etc.)
4. **Integrate into game board header**
5. **Keep full-screen SettingsModal** for comprehensive config

### File Structure:
```
src/app/
├── useDropdownBehavior.ts → Shared behavior hook

src/ui/molecules/
├── HamburgerMenu.tsx → Menu component
├── HamburgerMenu.module.css → Styling

src/ui/atoms/
├── DifficultyToggle.tsx → Game-specific toggle
├── SoundToggle.tsx → Shared toggle
└── [Other toggles as needed]
```

---

## 3. Reference Materials

**Source Files** (from TicTacToe):
- `src/ui/molecules/HamburgerMenu.tsx`
- `src/ui/molecules/HamburgerMenu.module.css`
- `src/app/useDropdownBehavior.ts`
- `src/ui/molecules/SettingsOverlay.tsx`
- `src/ui/atoms/DifficultyToggle.tsx`
- `src/ui/atoms/SoundToggle.tsx`

**Copy these files and adapt for your game's specific settings and theme variables.**

---

## 4. Implementation Checklist

- [ ] Copy useDropdownBehavior hook
- [ ] Create HamburgerMenu component
- [ ] Create HamburgerMenu.module.css styles
- [ ] Create game-specific toggle atoms
- [ ] Integrate HamburgerMenu into game board
- [ ] Wire up context providers (ThemeContext, SoundContext, etc.)
- [ ] Test on mobile and desktop
- [ ] Test keyboard navigation (ESC key)
- [ ] Test click-outside dismissal
- [ ] Verify z-index layering
- [ ] Test accessibility (ARIA labels, keyboard nav)

---

## References

- **AGENTS.md § 13**: Menu & Settings Architecture Governance
- **Responsive design**: 5-tier device architecture
- **Input controls**: Semantic action-based navigation

All specifications and architectural patterns apply uniformly across the game ecosystem.
