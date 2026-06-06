---
paths:
  - "packages/**/*.ts"
  - "example/**/*.ts"
---

# Security Rules

- Never log, expose, or embed API keys, tokens, or secrets anywhere in source files or example code.
- The `example/` app must not contain real API keys — use placeholder strings or environment
  variables.
- Never read from untrusted runtime sources (URL params, user input, API responses) without explicit
  validation before using the value in a style or passing it as a prop name.

```ts
// ✓ - icon name from a typed constant set
const VALID_ICONS = ["check", "close", "arrow"] as const

type IconName = (typeof VALID_ICONS)[number]

// ✗ - name derived from untrusted input with no validation
const iconName = route.params.icon // could be anything
```
