---
paths:
  - "packages/core/src/colors.ts"
  - "packages/core/src/**/*.ts"
---

# Worklet Rules

Some color utilities in `colors.ts` are tagged `"worklet"` and run on the Reanimated UI thread.
These have strict constraints.

## Worklet-Safe Functions

A function is worklet-safe when:

- It is tagged with `"worklet"` as the first statement.
- It performs only pure string/number operations — no external module calls.
- It does NOT import or call any `culori` function (culori is not worklet-safe).

```ts
// ✓ - worklet-safe: pure string manipulation only
export function withOpacity(color: string, opacity: number): string {
  "worklet"

  const clamped = Math.max(0, Math.min(1, opacity))
  // ... string manipulation only
}

// ✗ - NOT worklet-safe: calls culori which is not available on UI thread
export function lighten(color: string, amount: number): string {
  "worklet"

  const parsed = parse(color) // culori — crashes on UI thread
}
```

## JSDoc Annotation

Mark worklet-safe functions in their JSDoc. Mark non-safe functions explicitly when the distinction
matters.

```ts
/** ... Safe in worklets. */
export function withOpacity(...) { "worklet"; ... }

/** ... Not worklet-safe (uses culori). */
export function lighten(...) { ... }
```

## Adding New Color Utilities

Before adding a new utility to `colors.ts`:

1. Determine if it needs culori (not worklet-safe) or can work with pure strings/numbers
   (worklet-safe).
2. If worklet-safe: add `"worklet"` tag and document it.
3. If not worklet-safe: do NOT add `"worklet"` tag, document the limitation.
4. Export from `packages/core/src/index.ts` only after confirming the category.
