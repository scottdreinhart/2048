# Mobile Gesture Patterns

> **Authority**: AGENTS.md § 15 (Mobile Gestures)
> **Scope**: Swipe, long-press, haptic feedback

---

## 1. Swipe Gesture Hook

Detect swipe gestures (left, right, up, down) on touch devices.

### Usage
```typescript
import { useSwipeGesture } from '@/app'

const GameBoard = () => {
  const { onTouchStart, onTouchEnd } = useSwipeGesture({
    onSwipeLeft: () => moveCursor('right'),
    onSwipeRight: () => moveCursor('left'),
    onSwipeUp: () => moveCursor('down'),
    onSwipeDown: () => moveCursor('up'),
    threshold: 50,  // Min 50px to register
  })

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: 'none' }}  // Prevent browser defaults
    >
      {/* Board */}
    </div>
  )
}
```

### Configuration
- **threshold**: 50px (minimum distance to register swipe, adjustable per use case)
- **velocityThreshold**: 0.3 px/ms (prevent slow swipes from registering)

### When to Use
- Game board navigation (arrow equivalents)
- Image galleries (next/prev)
- Page transitions (mobile UX)
- Don't use for text selection or scrolling (browser delegates)

---

## 2. Long-Press Gesture Hook

Detect long-press (hold) for 500-1500ms on both touch and mouse.

### Usage
```typescript
import { useLongPress } from '@/app'

const TileButton = () => {
  const { onTouchStart, onTouchEnd } = useLongPress({
    duration: 800,  // 800ms before trigger
    onLongPress: () => showContextMenu(),
    onLongPressEnd: () => hideContextMenu(),
  })

  return (
    <button onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      Hold for options
    </button>
  )
}
```

### Duration Defaults
- **300ms**: Quick action (fast confirmation)
- **800ms**: Context menu (standard long-press duration)
- **1500ms**: Confirm dangerous action (delete, reset)

### When to Use
- Context menus on secondary action
- Swap/rotate game pieces (long-press = context)
- Confirm destructive actions (avoid accidental taps)

---

## 3. Haptic Feedback

Vibrate device on user action (supported on Web, iOS, Android).

### Already Integrated
```typescript
import { haptics } from '@/app'

// Trigger haptic feedback
haptics.light()   // Subtle feedback
haptics.medium()  // Standard feedback
haptics.heavy()   // Strong feedback
```

### Usage Patterns
```typescript
// On successful action
haptics.light()

// On error
haptics.heavy()

// On selection
haptics.medium()
```

### Supported Platforms
- ✅ Web (Vibration API)
- ✅ iOS (Capacitor)
- ✅ Android (Capacitor)

---

## 4. Combining Gestures

### Example: Game Board with Swipe + Long-Press
```tsx
const GameBoard = () => {
  const swipe = useSwipeGesture({
    onSwipeLeft: () => moveCursor('right'),
    onSwipeRight: () => moveCursor('left'),
  })

  const select = useLongPress({
    duration: 500,
    onLongPress: () => selectPiece(),
  })

  return (
    <div
      onTouchStart={(e) => {
        swipe.onTouchStart(e)
        select.onTouchStart()
      }}
      onTouchEnd={(e) => {
        swipe.onTouchEnd(e)
        select.onTouchEnd()
      }}
      style={{ touchAction: 'none' }}
    >
      {/* Board */}
    </div>
  )
}
```

---

## Testing Checklist

- [ ] Swipe Left/Right works on touch device
- [ ] Swipe Up/Down works on touch device
- [ ] Long-press triggers after configured duration
- [ ] Haptic feedback triggers on action
- [ ] No accidental gestures (threshold prevents false triggers)
- [ ] Desktop fallback (mouse) works too
- [ ] Gestures don't conflict with browser scrolling
