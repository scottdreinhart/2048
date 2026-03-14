# WCAG 2.1 AA Accessibility Governance

> **Authority**: Subordinate to AGENTS.md § 12
> **Scope**: Keyboard navigation, screen readers, semantic HTML, contrast

---

## 1. ESLint Enforcement

### Enabled Rules
- `jsx-a11y/*` — 30+ accessibility rules auto-checked
- `react/no-danger` — Prevents dangerouslySetInnerHTML
- `react/no-unescaped-entities` — Prevents HTML entity issues

### What's Enforced
- ✅ All buttons must be keyboard accessible (Tab)
- ✅ All interactive elements have focus indicators
- ✅ Links have descriptive text (not "click here")
- ✅ Images have alt text
- ✅ Forms have labels associated with inputs
- ✅ ARIA roles only on supported elements
- ✅ No positive tabIndex (natural tab order)

### Run checks:
```bash
pnpm lint  # ESLint a11y rules
```

---

## 2. Keyboard Navigation (Manual Testing)

### Required: Tab Order
- All interactive elements reachable via Tab
- Logical tab order (usually DOM order, test with Tab key)
- Focus indicator visible (CSS `:focus-visible` styled)

### Required: Escape Key
- Modals close on Escape
- Menus close on Escape
- Focus returns to trigger element

### Required: Arrow Keys
- Menu navigation: up/down/left/right arrows
- List navigation: up/down arrows
- Not required for single inputs

### Implementation:
```tsx
<button
  onKeyDown={(e) => {
    if (e.key === 'Escape') {
      closeModal()
    }
  }}
>
  Open
</button>
```

---

## 3. Screen Readers (ARIA)

### Required: aria-label (Icon Buttons Only)
```tsx
// ❌ INACCESSIBLE
<button>☰</button>

// ✅ ACCESSIBLE
<button aria-label="Open menu">☰</button>
```

### Required: aria-labelledby (Complex Elements)
```tsx
<div id="instructions">How to play</div>
<div aria-labelledby="instructions">
  {/* Content explained by heading */}
</div>
```

### Required: role (When Semantic HTML Insufficient)
```tsx
// ❌ BAD: generic div for button
<div onClick={...}>Submit</div>

// ✅ GOOD: actual button
<button onClick={...}>Submit</button>
```

### Required: aria-live (Dynamic Content)
```tsx
// Status updates on game board
<div aria-live="polite" aria-atomic="true">
  {gameStatus}  {/* Screen reader announces changes */}
</div>
```

---

## 4. Contrast Compliance (WCAG AA = 4.5:1)

### ESLint Cannot Detect Contrast
- Manual review or external tool required
- Use: WebAIM Contrast Checker, aXe DevTools, WAVE

### All Color Pairs Must Pass:
- Text on background: 4.5:1 minimum (AA), 7:1 (AAA)
- Large text (18pt+): 3:1 minimum (AA), 4.5:1 (AAA)
- UI components (borders, edges): 3:1 minimum

---

## 5. Semantic HTML

### Required: Proper Heading Hierarchy
```tsx
// ✅ GOOD
<h1>Main Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>

// ❌ BAD: Skip levels
<h1>Main Title</h1>
<h3>Subsection</h3>  {/* h2 missing */}
```

### Required: Form Labels
```tsx
// ✅ GOOD
<label htmlFor="username">Username</label>
<input id="username" type="text" />

// ❌ BAD: No label
<input type="text" placeholder="username" />
```

### Required: Alt Text on Images
```tsx
// ✅ GOOD
<img src="board.png" alt="3x3 game board with pieces" />

// ❌ BAD
<img src="board.png" />
```

---

## 6. Color-Alone Semantics (Forbidden)

### ❌ INACCESSIBLE
```css
.success { color: green; }
.error { color: red; }
```

### ✅ ACCESSIBLE
```css
.success::before { content: '✓'; color: green; }
.error::before { content: '✗'; color: red; }
```

---

## 7. Focus Indicators

### All :focus Elements Must be Visible
```css
button:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
}

/* Mobile touch doesn't show outline (ok) */
@media (pointer: coarse) {
  button:focus-visible {
    outline: none;
    background-color: var(--color-focus-bg);
  }
}
```

---

## Testing Checklist

- [ ] Tab through entire page — all controls reachable
- [ ] Escape key closes all modals
- [ ] Focus visible on every interactive element
- [ ] No positive tabIndex (natural order)
- [ ] All buttons have text or aria-label
- [ ] All images have alt text
- [ ] Headings in logical order (no skips)
- [ ] Form fields have labels
- [ ] Contrast passes: Run WebAIM Contrast Checker
- [ ] Screen reader test: NVDA / JAWS / VoiceOver
- [ ] No color-alone meaning (icons/text required)
