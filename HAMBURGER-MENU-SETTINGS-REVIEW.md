# Hamburger Menu & Settings Screen Review

> Comparing this project against TicTacToe (gold standard) and other sibling repos.

---

## 📊 Current State Comparison

### **TicTacToe** 🏆 Gold Standard

**Architecture:**
- **Dual-Menu System**: 
  1. **HamburgerMenu** — in-game quick settings (top-right header)
  2. **SettingsOverlay** — full-screen comprehensive settings (from menu)

**HamburgerMenu** (src/ui/molecules/HamburgerMenu.tsx):
```
┌─────────────────────────────────────┐
│ Score | Stats | [Hamburger Button]  │ ← Header
└─────────────────────────────────────┘
              ↓ (Portal to fixed position)
         ┌──────────────┐
         │ Difficulty ▼ │ ← Accessible while playing
         │ Series ▼     │
         │ Sound On/Off │
         │ Color Theme  │
         └──────────────┘
```

**Key Features:**
- ✅ 3-line icon animates to X (cubic-bezier spring)
- ✅ Portal-rendered dropdown (fixed position, above all elements)
- ✅ Positioned relative to button + board alignment
- ✅ Click-outside detection (useDropdownBehavior hook)
- ✅ Keyboard support (ESC to close, focus management)
- ✅ Touch-safe (no accidental gameplay triggers)
- ✅ Mobile-optimized (240px width, responsive top/left)

**SettingsOverlay** (src/ui/molecules/SettingsOverlay.tsx):
```
┌─────────────────────────────────────┐
│ ← Settings                          │
├─────────────────────────────────────┤
│ Difficulty    [Easy] [Medium] [Hard]│
│ Series        [1]    [3]     [5]    │
│ Sound         [On/Off]              │
│ Color Theme   [6 Options]           │
│ Display Mode  [Light/Dark/System]   │
│ Colorblind    [5 Options]           │
├─────────────────────────────────────┤
│                        [Cancel] [OK]│
└─────────────────────────────────────┘
```

**Key Features:**
- ✅ Full-screen modal (scrollable if needed)
- ✅ Organized sections (game / theme / accessibility)
- ✅ All context providers integrated (ThemeContext, etc.)
- ✅ Accessible radio/button groups
- ✅ Uses same atoms as HamburgerMenu (DifficultyToggle, SoundToggle, etc.)

---

## 🔧 Technical Deep-Dive: How It Works

### **1. The HamburgerMenu Component**

```tsx
// TicTacToe pattern
<HamburgerMenu>
  <MenuButton onDifficulty={setDifficulty}>Easy / Medium / Hard</MenuButton>
  <MenuButton onSeries={setSeries}>1 / 3 / 5</MenuButton>
  <SoundToggle enabled={soundEnabled} onToggle={toggleSound} />
</HamburgerMenu>
```

**Portal Rendering** (z-index 9999):
```tsx
createPortal(
  <div className={styles.panel} style={{ top, left }}>
    {children}
  </div>,
  document.body
)
```

**CSS Animation** (HamburgerMenu.module.css):
```css
.lineOpen:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg);  /* Top line → top of X */
}
.lineOpen:nth-child(2) {
  opacity: 0;  /* Middle line disappears */
}
.lineOpen:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg);  /* Bottom line → bottom of X */
}

@keyframes panelEnter {
  0% { opacity: 0; transform: scale(0.9) translateY(-8px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
```

### **2. The useDropdownBehavior Hook**

```tsx
// Shared by HamburgerMenu and any other dropdown
const useDropdownBehavior = ({
  open,
  onClose,
  triggerRef,  // Button ref
  panelRef,    // Dropdown panel ref
  onOutsideClick,
}) => {
  useEffect(() => {
    if (!open) return

    const handleOutside = (e: Event) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !panelRef.current?.contains(e.target)
      ) {
        onClose()
      }
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleKey)

    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, triggerRef, panelRef, onClose])
}
```

### **3. Smart Position Calculation**

```tsx
useLayoutEffect(() => {
  if (!open || !btnRef.current) return

  const rect = btnRef.current.getBoundingClientRect()
  const boardEl = document.getElementById('game-board')
  const boardRect = boardEl?.getBoundingClientRect() || { /* ... */ }

  // Align panel's right edge to board's right edge
  let left = boardRect.right - panelWidth
  
  // Prevent overflow left of board
  if (left < boardRect.left + pad) {
    left = boardRect.left + pad
  }

  setPanelPos({ 
    top: rect.bottom + 8,  // Below button
    left
  })
}, [open])
```

---

## ✅ Implementation Guide for This Project

### **Phase 1: Add In-Game Menu (Quick Win)**

1. **Create `useDropdownBehavior` hook** (copy from TicTacToe)
   - Location: `src/app/useDropdownBehavior.ts`
   - Enables reusable dropdown/menu behavior

2. **Create `HamburgerMenu` component** (adapt from TicTacToe)
   - Location: `src/ui/molecules/HamburgerMenu.tsx`
   - Add to game board header
   - Quick settings optimized for gameplay

3. **Create reusable atom toggles**:
   - Import or adapt toggles from existing components
   - DifficultyToggle, SoundToggle, ThemeToggle

4. **Integrate into game board**:
   ```tsx
   <div className={styles.header}>
     <span className={styles.stats}>/* game info */</span>
     <HamburgerMenu>
       {/* Quick settings here */}
     </HamburgerMenu>
   </div>
   ```

### **Phase 2: Enhance Settings Modal (Polish)**

1. **Add theme selector** (like TicTacToe)
   - Color theme options
   - Light/Dark/System mode

2. **Add sound control** (persistent toggle)
   - Integrate with SoundContext
   - Expose in settings modal

### **Phase 3: Accessibility (Future)**

- Colorblind mode options
- Reduced motion preference
- High contrast mode

---

## 🏗️ Reference Implementation

**Canonical Source**: TicTacToe
- **HamburgerMenu**: `src/ui/molecules/HamburgerMenu.tsx`
- **useDropdownBehavior**: `src/app/useDropdownBehavior.ts`
- **SettingsOverlay**: `src/ui/molecules/SettingsOverlay.tsx`
- **Atoms**: `src/ui/atoms/DifficultyToggle.tsx`, `SoundToggle.tsx`, etc.

Copy and adapt these files for your implementation.

---

## 📐 Design Specs

| Aspect | Value | Rationale |
|---|---|---|
| **Icon Size** | 20px (3 lines) | Standard mobile button |
| **Button Size** | 48px min (mobile-safe) | Touch target WCAG |
| **Panel Width** | 240px | Fits most mobile viewports |
| **Animation** | 300ms cubic-bezier(0.34, 1.56, 0.64, 1) | Spring-like feel |
| **Z-Index** | 9999 | Above all game elements |
| **Position** | Fixed, top-right | Standard menu location |
| **Padding** | 14px 16px | Comfortable spacing |
| **Border Radius** | 12px | Rounded modern look |

---

## ✅ Implementation Checklist

- [ ] Copy `useDropdownBehavior.ts` from TicTacToe
- [ ] Create `HamburgerMenu.tsx` with 3-line animation
- [ ] Create `HamburgerMenu.module.css` with portal styles
- [ ] Create or adapt toggle atoms (DifficultyToggle, SoundToggle, etc.)
- [ ] Integrate HamburgerMenu into game board header
- [ ] Test menu open/close on desktop and mobile
- [ ] Test keyboard shortcuts (ESC to close)
- [ ] Test click-outside behavior
- [ ] Verify z-index doesn't conflict with other modals
- [ ] Update component barrels (`src/ui/atoms/index.ts`, `molecules/index.ts`)
- [ ] Add accessible ARIA labels
- [ ] Test on TV/gamepad if applicable
