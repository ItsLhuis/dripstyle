---
paths:
  - "packages/core/src/**/*.ts"
  - "example/**/*.ts"
  - "example/**/*.tsx"
---

# Hook Rules

- Hook filenames are camelCase: `useTheme.ts`, not `UseTheme.ts`. Use `.tsx` only when the hook
  returns JSX.
- Hooks are declared as named functions: `export function useMyHook() { ... }`. Never arrow function
  syntax.
- Export directly on the function declaration — never a separate `export { }` block.
- Hooks inside `packages/core/src/` that are part of the public API must be exported from
  `packages/core/src/index.ts`.
- Internal helpers used only inside `packages/core/src/` must NOT appear in the public barrel.
- Hooks that depend on `react-native-reanimated` must guard against its absence:

```ts
// ✓ - optional peer dep guard
let useSharedValue: typeof import("react-native-reanimated").useSharedValue | undefined

try {
  useSharedValue = require("react-native-reanimated").useSharedValue
} catch {
  useSharedValue = undefined
}
```
