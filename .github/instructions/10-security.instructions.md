# Security Governance

> **Authority**: AGENTS.md § 6
> **Scope**: XSS prevention, input sanitization, secrets management, CSP

---

## 1. ESLint Enforcement

ESLint security rules (`eslint-plugin-security`) automatically catch many vulnerabilities.

### Rule: react/no-danger (Error)
```tsx
// ❌ FORBIDDEN: dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ SAFE: React escapes by default
<div>{userContent}</div>
```

### Rule: security/detect-unsafe-regex (Error)
```typescript
// ❌ FORBIDDEN: Regex DoS vulnerability
const regex = /(a+)+$/  // Exponential backtracking

// ✅ SAFE: No exponential patterns
const regex = /^[a-z]+$/
```

### Rule: security/detect-unvalidated-redirect (Error)
```tsx
// ❌ FORBIDDEN: User input controls redirect
window.location = userProvidedUrl

// ✅ SAFE: Whitelist URLs
const ALLOWED_URLS = ['/', '/game', '/about']
if (ALLOWED_URLS.includes(url)) {
  window.location = url
}
```

---

## 2. Input Sanitization

### Rule: Always Escape User Input (React Default)
```tsx
// ✅ SAFE: React escapes all string interpolation
const username = props.username
<div>{username}</div>  // "<script>alert('xss')</script>" → safe text

// ❌ UNSAFE: Direct innerHTML
element.innerHTML = userInput  // XSS vulnerability!

// ✅ SAFE: Use React, not DOM APIs
<div data-value={userInput}>{user}</div>
```

### Rule: Validate URLs
```tsx
// ❌ UNSAFE: User URL without validation
<a href={userProvidedUrl}>Click</a>

// ✅ SAFE: Validate protocol
const isSafeUrl = (url: string) => {
  try {
    const u = new URL(url, window.location.href)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

if (isSafeUrl(url)) {
  <a href={url}>Click</a>
}
```

### Rule: JSON.parse() — Validate First
```typescript
// ❌ RISKY: Parsing untrusted JSON
const data = JSON.parse(userInput)

// ✅ SAFE: Validate schema
import { z } from 'zod'
const schema = z.object({
  name: z.string(),
  score: z.number(),
})
const data = schema.parse(JSON.parse(userInput))  // Throws if invalid
```

---

## 3. Secrets Management

### Rule: No API Keys in Source Code
```typescript
// ❌ FORBIDDEN
const API_KEY = 'sk-1234567890abcdef'

// ✅ SAFE: Environment variables
const API_KEY = import.meta.env.VITE_API_KEY
```

### Rule: .env.local Gitignored (Already Done)
```bash
# .gitignore
.env.local
.env.*.local
```

### Accessing Secrets:
```typescript
// .env
VITE_API_BASE_URL=https://api.example.com

// src/config.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Only VITE_* variables exposed to browser (all are public)
```

---

## 4. Content Security Policy (Optional)

### Recommended CSP Header:
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none'
```

### For Electron/Capacitor:
```javascript
// electron/main.js
mainWindow.webPreferences = {
  preload: path.join(__dirname, 'preload.js'),
  sandbox: true,
  contextIsolation: true,
}
```

---

## Testing Checklist

- [ ] Run `pnpm lint` — no dangerous HTML patterns
- [ ] Security plugin rules all pass
- [ ] No dangerouslySetInnerHTML in codebase
- [ ] All API responses validated with schema
- [ ] Environment variables not hardcoded
- [ ] No user input in redirects without whitelist
- [ ] localStorage/sessionStorage not storing secrets
- [ ] All onclick/onX handlers validated
