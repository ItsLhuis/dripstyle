---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/__tests__/**"
---

# Testing Rules

No test runner is configured yet. When tests are added, use **Vitest** — not Jest. This section
records conventions for when testing is introduced.

## What to Test

- **Pure utility functions** (`colors.ts`, `responsive.ts`, `variants.ts` logic): high coverage,
  cheap, no RN dependencies. These are the primary testing target.
- **Type correctness**: use `expectTypeOf` (Vitest) for public API type assertions — especially
  module augmentation inference via `DripstyleThemes` / `DripstyleBreakpoints`.
- **Hook behavior**: test with `@testing-library/react-native` when hooks carry non-trivial state or
  side effects.

## What NOT to Test

- React Native `StyleSheet` internals — trust the platform.
- The `example/` app — covered manually.
- Snapshot tests of styles — banned. Values change; behavior is what matters.

## File Placement

| Test kind          | Location                                         |
| ------------------ | ------------------------------------------------ |
| Utility unit tests | `packages/<pkg>/src/__tests__/<name>.test.ts`    |
| Hook tests         | `packages/core/src/__tests__/<hookName>.test.ts` |
| Type tests         | `packages/<pkg>/src/__tests__/<name>.test-d.ts`  |

## Structure

- `test(...)` at the top level for files with fewer than four tests; `describe(...)` only to group
  beyond that threshold.
- Test names: `<behavior> when <condition>`.
- Arrange → Act → Assert with one blank line between sections. No comments labeling sections.

```ts
// ✓
test("withOpacity replaces alpha on rgba string", () => {
  const color = "rgba(255, 0, 0, 1)"

  const result = withOpacity(color, 0.5)

  expect(result).toBe("rgba(255, 0, 0, 0.5)")
})
```

## Determinism

- No real timers. Use `vi.useFakeTimers()` for anything time-dependent.
- Worklet-safe functions (`withOpacity`, `alpha`, etc.) must be testable without a React Native
  environment — keep their imports free of RN dependencies.
