# Performance & Web Vitals Governance

> **Authority**: AGENTS.md § 4 (Performance Guardrails)
> **Scope**: Performance budgets, Web Vitals targets, bundle analysis

---

## 1. Web Vitals Targets

### Google Core Web Vitals (2024 Standards)

| Metric | Target | Tool |
|--------|--------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | DevTools > Performance |
| **INP** (Interaction to Next Paint) | < 200ms | Web Vitals library |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Web Vitals library |
| **TTFB** (Time to First Byte) | < 500ms | DevTools > Network |
| **FCP** (First Contentful Paint) | < 1.8s | DevTools > Performance |

### Current Project Targets:
- **LCP**: 2.0s (aim for 80th percentile)
- **INP**: 150ms (interactive components)
- **CLS**: 0.05 (prevent jank)
- **Bundle**: < 150KB gzipped (app.js)

---

## 2. Bundle Size Budgets

### Monitor with:
```bash
# Analyze bundle
pnpm exec vite build && npx vite-plugin-visualizer dist/stats.html

# Check size
ls -lh dist/assets/
```

---

## 3. ESLint Performance Rules (Enforced)

### Rules That Prevent Regressions
- `react-hooks/exhaustive-deps: 'error'` — Finds missing deps, prevents stale closures
- `@typescript-eslint/no-explicit-any: 'error'` — Type safety = bundle predictability
- `no-console: ['error']` — Removed in production (tree-shakes cleanly)
- `react/no-array-index-key: 'warn'` — Bad key strategy causes re-renders

### Violations Caught:
```typescript
// ❌ ERROR: Missing dependency in useMemo
const value = useMemo(() => cheapCalc(data), [])  // Forgot data!

// ❌ ERROR: Avoid any (hides bundle bloat)
const handler = (x: any) => x * 2

// ❌ WARN: Array index as key (re-renders items)
{items.map((item, idx) => <Item key={idx} />)}  // Bad!
```

---

## 4. React Performance Patterns

### Use useCallback When:
1. Function passed to memoized child
2. Function used in dependency array

### Use useMemo When:
1. Expensive computation (profile first!)
2. Memoized child depends on it
3. Default: DON'T use (premature optimization)

### Rule: Profile Before Optimizing
```typescript
// Bad: Premature optimization
const value = useMemo(() => doSomething(x), [x])

// Good: Profile first
// 1. Open DevTools > Performance Profiler
// 2. Record interaction
// 3. See if component re-renders excessively
// 4. THEN add useMemo if needed
```

---

## 5. Animation Performance

### GPU-Accelerated Only
```css
/* ✅ GOOD: GPU-accelerated (transform, opacity) */
@keyframes slide {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* ❌ BAD: Repaints (avoid) */
@keyframes slide {
  from { width: 0; margin-left: 100%; }
  to { width: 100%; margin-left: 0; }
}
```

### Respect prefers-reduced-motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Code Splitting Strategy

### Lazy Load Heavy Features
```tsx
import { lazy, Suspense } from 'react'

const ResultsTable = lazy(() => import('./ResultsTable'))

export const App = () => (
  <Suspense fallback={<LoadingScreen />}>
    <ResultsTable />
  </Suspense>
)
```

---

## Testing Checklist

- [ ] Lighthouse score: 90+ (Performance)
- [ ] Bundle size < 150KB gzipped
- [ ] No console warnings in DevTools
- [ ] No unnecessary re-renders (DevTools Profiler)
- [ ] Animations only use transform/opacity
- [ ] prefers-reduced-motion respected
- [ ] Lazy loading for heavy features
