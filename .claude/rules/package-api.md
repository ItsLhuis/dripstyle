---
paths:
  - "packages/*/src/index.ts"
  - "packages/*/src/**/*.ts"
---

# Package API Rules

## Public Surface

All public exports flow through `packages/<pkg>/src/index.ts`. Adding a new export to the barrel
changes the public API and may require a semver bump.

- Add to `index.ts` only what consumers need. Internal helpers stay unexported.
- Never import from `packages/core/src/<file>` directly in `packages/presets` or `example/` — always
  import from the package name (`@dripstyle/core`).

## Optional Peer Dependencies

`react-native-reanimated` and `react-native-safe-area-context` are optional. Any code path that uses
them must degrade gracefully when they are absent. Guard with a `try/require` or a runtime
capability check — never assume they are present.

```ts
// ✓ - graceful degradation
let Reanimated: typeof import("react-native-reanimated") | undefined

try {
  Reanimated = require("react-native-reanimated")
} catch {
  Reanimated = undefined
}

// ✗ - hard import breaks consumers who haven't installed the optional dep
import Animated from "react-native-reanimated"
```

## Module Augmentation Pattern

Consumers extend the library's type system via `DripstyleThemes` and `DripstyleBreakpoints`. Never
change these interfaces to `type` aliases — they must remain `interface` for declaration merging.

When adding new extensible dimensions to the core, follow the same pattern: define an empty
`interface`, add a `[keyof X] extends [never]` fallback, and export the resolved type union.

## Barrel Hygiene

Re-export only named exports — no default exports from any package barrel.

```ts
// ✓
export { StyleSheet } from "./stylesheet"
export type { StyleConfigureOptions } from "./types"

// ✗
export { default as StyleSheet } from "./stylesheet"
```
