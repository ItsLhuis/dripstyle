# @dripstyle/presets

Official design system presets for [`@dripstyle/core`](../core/README.md). Each preset provides a
theme object, a token accessor library, and optionally a raw color palette — all ready to pass
directly to `StyleSheet.configure()`.

The preset system is open-ended: you can use an official preset, build a custom one, or combine
both.

---

## Available Presets

| Preset                                | Subpath                       | Description                                                                              |
| ------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------- |
| [Tailwind v4](src/tailwind/README.md) | `@dripstyle/presets/tailwind` | Tailwind v4 color palette, semantic light/dark themes, and a full token accessor library |

---

## Installation

```bash
npm install @dripstyle/core @dripstyle/presets

# or
yarn add @dripstyle/core @dripstyle/presets

# or
pnpm add @dripstyle/core @dripstyle/presets
```

> There is no root export. `import { ... } from '@dripstyle/presets'` is a compile error by design.
> Always import from a preset's subpath (e.g. `@dripstyle/presets/tailwind`).

---

## Using a Preset

Every preset exports at minimum a `preset` object with a `themes` property:

```typescript
import { StyleSheet } from "@dripstyle/core"

import { preset } from "@dripstyle/presets/tailwind"

StyleSheet.configure({
  themes: preset.themes
})
```

Presets may also export `breakpoints`, a raw `palette`, or other utilities — see each preset's own
README for details.

---

## Building a Custom Preset

A preset is any object whose `themes` property satisfies the shape expected by
`StyleSheet.configure()`. There is no base class or interface to implement.

```typescript
// my-preset/index.ts
export const preset = {
  themes: {
    light: {
      colors: {
        background: "rgb(255, 255, 255)",
        foreground: "rgb(10, 10, 10)"
        // ...
      }
    },
    dark: {
      colors: {
        background: "rgb(10, 10, 10)",
        foreground: "rgb(255, 255, 255)"
        // ...
      }
    }
  }
}
```

Pass it to `StyleSheet.configure()` exactly like an official preset, then augment `Register` to
enable type inference:

```typescript
declare module "@dripstyle/core" {
  interface Register {
    themes: typeof preset.themes
  }
}
```
