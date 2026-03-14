# Error Handling & Recovery Patterns

> **Authority**: AGENTS.md § 3 (Error Handling & Recovery)
> **Scope**: Error boundaries, recovery UI, error classification

---

## 1. Error Boundary Component

Import and wrap your application with ErrorBoundary to catch rendering errors:

```tsx
import { ErrorBoundary } from '@/ui/organisms'
import { crashLogger } from '@/app'

<ErrorBoundary
  onError={(error, info) => {
    crashLogger.error('React Error Boundary', error.message, {
      stack: error.stack,
      componentStack: info.componentStack,
    })
  }}
>
  <GameBoard />
  <ResultsTable />
</ErrorBoundary>
```

### What It Catches
- ✅ Rendering errors (any component in tree)
- ✅ Lifecycle method errors
- ❌ Event handler errors (use try/catch)
- ❌ Async errors (use async try/catch)

### What It Doesn't Catch
```typescript
// ❌ Not caught by error boundary — handle in event handler
const handler = async () => {
  try {
    await fetchData()
  } catch (e) {
    // Handle here, not in boundary
    showErrorToast(e.message)
  }
}
```

---

## 2. Error Classification

### User Error (Form Validation)
```typescript
// User entered invalid data
const error = validateForm(formData)
if (error) {
  // Show inline feedback on form
  setFormErrors(error)
}
```

### Recoverable System Error (Network)
```typescript
// Network timeout, server 5xx
try {
  const data = await fetch(url)
} catch (e) {
  // Offer retry
  showErrorToast('Connection failed. Retry?', {
    action: 'Retry',
    onAction: () => refetch(),
  })
}
```

### Fatal Error (Data Corruption)
```typescript
// Invalid state, security violation
if (!validateGameState(state)) {
  // Clear cache, restart
  localStorage.removeItem('gameState')
  window.location.reload()
}
```

---

## 3. Error Recovery Actions

| Type | Recovery | Message |
|------|----------|---------|
| Form validation | Fix inputs | "Please fill all fields" |
| Network timeout | Retry | "Connection lost. Retry?" |
| Server error (500) | Retry later | "Server error. Try later." |
| Data corruption | Restart app | "Data corrupted. Starting over." |
| Out of memory | Clear cache | "Memory full. Clearing cache." |

---

## 4. Best Practices

### Always Log Errors
```typescript
// Use crashLogger (already integrated)
import { crashLogger } from '@/app'

try {
  riskyOperation()
} catch (e) {
  crashLogger.error('Operation failed', e.message, {
    stack: e.stack,
    context: 'game-move',
  })
}
```

### Provide User Feedback
Never silently fail. Always tell user what happened and next step.

### Graceful Degradation
If feature fails, app should still be usable with reduced functionality.

---

## Testing Checklist

- [ ] Error boundary catches rendering errors
- [ ] Fallback UI displays correctly
- [ ] Retry button works
- [ ] Error logged to crashLogger
- [ ] Network errors trigger retry UI
- [ ] Form validation shows feedback
- [ ] Corrupted state triggers restart
