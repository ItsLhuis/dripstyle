# @dripstyle/presets/tailwind

Tailwind v4-faithful design system preset for [`@dripstyle/core`](../../../core/README.md). Includes
a pre-converted color palette, semantic light and dark themes with 44 color tokens, and a full token
accessor library — all declared as Reanimated worklets.

---

## Quick Setup

```typescript
// app/_layout.tsx
import { StyleSheet } from "@dripstyle/core"

import { preset } from "@dripstyle/presets/tailwind"

StyleSheet.configure({
  themes: preset.themes,
  breakpoints: preset.breakpoints,
  settings: { adaptiveThemes: true }
})
```

```typescript
// types/dripstyle.d.ts — enables full TypeScript type inference
import { preset } from "@dripstyle/presets/tailwind"

declare module "@dripstyle/core" {
  interface Register {
    themes: typeof preset.themes
    breakpoints: typeof preset.breakpoints
  }
}
```

---

## Exports

```typescript
import { preset, palette } from "@dripstyle/presets/tailwind"

import type { Colors, TailwindTheme, Palette } from "@dripstyle/presets/tailwind"
```

---

## `preset`

```typescript
const preset = {
  themes: { light: TailwindTheme, dark: TailwindTheme },
  breakpoints: { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 }
}
```

Pass directly to `StyleSheet.configure()`. Both `light` and `dark` themes share the same accessor
function references — `preset.themes.light.space === preset.themes.dark.space` is `true`.

---

## `TailwindTheme` — Token Accessors

Every accessor is declared with `"worklet"` and is safe inside Reanimated worklets.

| Accessor                    | Example                                 | Returns                            |
| --------------------------- | --------------------------------------- | ---------------------------------- |
| `theme.space(key)`          | `space("4")` → `16`                     | `number` (4px base unit)           |
| `theme.size(key, runtime?)` | `size("full")` → `"100%"`               | `number \| string`                 |
| `theme.fontSize(key)`       | `fontSize("xl")` → `20`                 | `number`                           |
| `theme.lineHeight(key)`     | `lineHeight("normal")` → `1.5`          | `number`                           |
| `theme.fontWeight(key)`     | `fontWeight("bold")` → `"700"`          | `string`                           |
| `theme.letterSpacing(key)`  | `letterSpacing("wide")` → `0.4`         | `number`                           |
| `theme.radius(key)`         | `radius("lg")` → `8`                    | `number`                           |
| `theme.shadow(key)`         | `shadow("md")` → `{ shadowColor, ... }` | `ShadowStyle`                      |
| `theme.opacity(value)`      | `opacity(50)` → `0.5`                   | `number`                           |
| `theme.zIndex(key)`         | `zIndex("modal")` → `1050`              | `number`                           |
| `theme.borderWidth(key)`    | `borderWidth("md")` → `2`               | `number`                           |
| `theme.aspectRatio(key)`    | `aspectRatio("video")` → `1.7778`       | `number`                           |
| `theme.duration(value)`     | `duration(300)` → `300`                 | `number`                           |
| `theme.easing(key)`         | `easing("out")` → `[0, 0, 0.2, 1]`      | `[number, number, number, number]` |

Raw number inputs to `space` and `size` are multiplied by 4: `space(2)` → `8`.

---

## `Colors` — Semantic Color Tokens

44 semantic keys, all typed as `string` (CSS `rgb()` format):

| Group     | Keys                                                                                                                                                                                |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Surfaces  | `background`, `foreground`, `card`, `cardForeground`, `popover`, `popoverForeground`                                                                                                |
| Brand     | `primary`, `primaryForeground`, `secondary`, `secondaryForeground`                                                                                                                  |
| States    | `muted`, `mutedForeground`, `accent`, `accentForeground`, `destructive`, `destructiveForeground`                                                                                    |
| UI Chrome | `border`, `input`, `ring`                                                                                                                                                           |
| Charts    | `chart1` – `chart5`                                                                                                                                                                 |
| Tab Bar   | `tabbar`, `tabbarForeground`, `tabbarPrimary`, `tabbarPrimaryForeground`, `tabbarAccent`, `tabbarAccentForeground`, `tabbarBorder`, `tabbarRing`                                    |
| Feedback  | `info`, `infoForeground`, `infoBorder`, `success`, `successForeground`, `successBorder`, `warning`, `warningForeground`, `warningBorder`, `error`, `errorForeground`, `errorBorder` |

Usage in a style factory:

```typescript
const styles = StyleSheet.create(({ theme }) => ({
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: theme.borderWidth("base"),
    borderRadius: theme.radius("lg"),
    padding: theme.space("4")
  },
  cardTitle: {
    color: theme.colors.cardForeground,
    fontSize: theme.fontSize("lg"),
    fontWeight: theme.fontWeight("semibold")
  }
}))
```

---

## `palette` — Raw Tailwind v4 Colors

The full Tailwind v4 color palette as pre-converted `rgb(r, g, b)` strings.

```typescript
import { palette } from "@dripstyle/presets/tailwind"

palette.blue[500] // "rgb(59, 130, 246)"
palette.red[900] // "rgb(127, 29, 29)"
palette.white // "rgb(255, 255, 255)"
palette.black // "rgb(0, 0, 0)"
palette.transparent // "rgb(0, 0, 0)"
```

**22 color families**: red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue,
indigo, violet, purple, fuchsia, pink, rose, slate, gray, zinc, neutral, stone.

**11 shades per family**: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950.

Invalid shade keys are a compile error: `palette.blue[123]` → TypeScript error (`123` is not in
`ShadeKey`).

---

## Types

```typescript
import type { Colors, TailwindTheme, Palette } from "@dripstyle/presets/tailwind"
```

| Type            | Description                                                                    |
| --------------- | ------------------------------------------------------------------------------ |
| `Colors`        | The 44 semantic color keys, all `string`                                       |
| `TailwindTheme` | `{ colors: Colors } & all accessor functions`                                  |
| `Palette`       | `Record<FamilyName, Record<ShadeKey, string>> & { white, black, transparent }` |

> `Colors` is exported from `@dripstyle/presets/tailwind` only — it is not available from
> `@dripstyle/core`.
