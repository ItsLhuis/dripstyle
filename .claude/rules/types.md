---
paths:
  - "packages/**/*.ts"
  - "packages/**/*.tsx"
---

# Type Rules

- Use `type` by default. Use `interface` only for module augmentation (`DripstyleThemes`,
  `DripstyleBreakpoints`) — these must be interfaces to support `declare module` merging.
- Never use `any`. Use `unknown` for truly unknown values and narrow with type guards. The few
  internal `any` escapes are already in `types.ts` and are annotated with `eslint-disable`.
- Never use non-null assertion (`!`). Narrow explicitly with a guard or conditional.
- Export types inline on the declaration: `export type Foo = { ... }`. Never include types in a
  bottom `export { }` block.
- Keep file-private types unexported.
- Use inline `type` modifier for type-only imports: `import { type Foo }` or
  `import { Bar, type Baz }`. Never use a separate `import type { }` statement.
- When extracting variant prop types for a component, use `StyleVariants<typeof stylesheet, "key">`
  from `@dripstyle/core` — never redefine variant types manually.

```ts
// ✓ - module augmentation must use interface
declare module "@dripstyle/core" {
  interface DripstyleThemes extends typeof myThemes {}
  interface DripstyleBreakpoints extends typeof myBreakpoints {}
}

// ✓ - all other shapes use type
export type ButtonProps = StyleVariants<typeof stylesheet, "button"> & {
  children: React.ReactNode
}

// ✓ - inline type modifier on import
import { useStyles, type StyleVariants } from "@dripstyle/core"

// ✗ - separate import type statement
import type { StyleVariants } from "@dripstyle/core"
import { useStyles } from "@dripstyle/core"
```
