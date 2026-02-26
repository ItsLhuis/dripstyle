# @dripstyle/core

## Overview

`@dripstyle/core` is a pure, type-safe, extensible React Native styling engine. It provides a
`StyleSheet` API that is a drop-in superset of `RN.StyleSheet`, a theme system with full TypeScript
type inference, a variant system with Map-based caching, and a set of color utilities powered by
[culori](https://github.com/Evercoder/culori).

It ships zero design opinions — no hardcoded colors, spacing, or typography. Pair it with
`@dripstyle/presets/tailwind` for a complete Tailwind v4-based design system.

---

## Installation

```bash
npm install @dripstyle/core @dripstyle/presets

# or
yarn add @dripstyle/core @dripstyle/presets

# or
pnpm add @dripstyle/core @dripstyle/presets
```

### Optional peer dependencies

```bash
# For animated theme support (useAnimatedTheme):
npm install react-native-reanimated

# For safe area insets in runtime (runtime.insets):
npm install react-native-safe-area-context
```

---

## Configuration

Call `StyleSheet.configure()` once, before the React tree mounts — typically in your root layout
file.

```typescript
// app/_layout.tsx (or App.tsx)
import { StyleSheet } from "@dripstyle/core"

import { preset } from "@dripstyle/presets/tailwind"

StyleSheet.configure({
  themes: preset.themes,
  settings: {
    adaptiveThemes: true // auto-switch based on system color scheme
  }
})
```

**Manual initial theme:**

```typescript
StyleSheet.configure({
  themes: preset.themes,
  settings: {
    initialTheme: "dark"
  }
})
```

**Async-loaded initial theme (synchronous function):**

```typescript
StyleSheet.configure({
  themes: preset.themes,
  settings: {
    initialTheme: () => loadStoredThemeSync() // must return string, not Promise
  }
})
```

> `adaptiveThemes` and `initialTheme` are mutually exclusive. Using both simultaneously throws a DEV
> error at configure time.

---

## ThemeProvider Setup

Wrap your app root (or any subtree) with `<ThemeProvider>`. It takes zero props.

```tsx
// app/_layout.tsx
import { ThemeProvider } from "@dripstyle/core"

export default function RootLayout() {
  return <ThemeProvider>{/* App content */}</ThemeProvider>
}
```

---

## Module Augmentation (Register interface)

Augmenting the `Register` interface enables full TypeScript type-checking for theme properties and
theme name literals across the entire codebase.

```typescript
// types/dripstyle.d.ts
import { preset } from "@dripstyle/presets/tailwind"

declare module "@dripstyle/core" {
  interface Register {
    themes: typeof preset.themes
  }
}
```

After augmentation:

- `theme.colors.primary` → typed as `string`
- `theme.space("4")` → typed as `number`
- `theme.doesNotExist` → TypeScript compile error
- `setTheme("invalid")` → TypeScript compile error

---

## Basic Component Styling

```typescript
import { StyleSheet, useStyles } from "@dripstyle/core"

const styles = StyleSheet.create(({ theme }) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.space("4"),
  },
  title: {
    fontSize: theme.fontSize("xl"),
    fontWeight: theme.fontWeight("bold"),
    color: theme.colors.foreground,
  },
}))

function MyComponent() {
  const style = useStyles(styles)

  return (
    <View style={style.container}>
      <Text style={style.title}>Hello, @dripstyle!</Text>
    </View>
  )
}
```

The factory function receives `{ theme, runtime }` at render time — not at definition time. Plain
objects (no factory) behave identically to `RN.StyleSheet.create()` and never re-render on theme
switch.

---

## Theme Switching

```typescript
import { useTheme } from "@dripstyle/core"

function ThemeToggle() {
  const { themeName, setTheme } = useTheme()

  return (
    <Button
      onPress={() => setTheme(themeName === "light" ? "dark" : "light")}
      title={`Switch to ${themeName === "light" ? "dark" : "light"} mode`}
    />
  )
}
```

Only components consuming `useStyles()` or `useTheme()` re-render on theme switch. Components using
plain `StyleSheet.create({})` are unaffected.

---

## Variant System

```typescript
import { createVariant, StyleSheet, useStyles } from "@dripstyle/core"

import type { StyleVariants } from "@dripstyle/core"

const buttonVariant = createVariant({
  base: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center" as const,
  },
  variants: {
    intent: {
      primary: { backgroundColor: "rgb(99, 102, 241)" },
      secondary: { backgroundColor: "rgb(243, 244, 246)" },
      ghost: { backgroundColor: "transparent" },
    },
    size: {
      sm: { paddingHorizontal: 12, paddingVertical: 8 },
      md: { paddingHorizontal: 16, paddingVertical: 12 },
      lg: { paddingHorizontal: 24, paddingVertical: 16 },
    },
    disabled: {
      true: { opacity: 0.5 },
      false: {},
    },
  },
  defaultVariants: { intent: "primary", size: "md", disabled: "false" },
})

const styles = StyleSheet.create(({ theme }) => ({
  button: buttonVariant,
  container: { flex: 1, backgroundColor: theme.colors.background },
}))

// Extract variant types for component props:
type ButtonProps = StyleVariants<typeof styles, "button"> & {
  onPress: () => void
  label: string
}

function Button({ intent, size, disabled, onPress, label }: ButtonProps) {
  const style = useStyles(styles)

  return (
    <Pressable style={style.button({ intent, size, disabled })} onPress={onPress}>
      <Text>{label}</Text>
    </Pressable>
  )
}
```

Variant results are cached using a `Map` keyed by serialized props — the same prop combination
always returns the same object reference.

Boolean variant keys (`"true"` / `"false"`) are automatically typed as `boolean` in the component
props via `StyleVariants`.

---

## Responsive Styles

```typescript
import { StyleSheet, useStyles, responsive } from "@dripstyle/core"

const styles = StyleSheet.create(({ runtime }) => ({
  container: {
    paddingHorizontal: responsive({ xs: 16, md: 24, lg: 32 }, runtime.breakpoint),
    maxWidth: responsive({ xs: undefined, lg: 1024 }, runtime.breakpoint)
  }
}))
```

`responsive()` returns the value for the largest breakpoint whose key is ≤ the current breakpoint.
For example, `responsive({ xs: 10, md: 20 }, "sm")` returns `10` (falls back to `xs`).

---

## ScopedTheme

Force a subtree to use a specific theme regardless of the app-level active theme.

```tsx
import { ScopedTheme } from "@dripstyle/core"

function BottomSheet() {
  return (
    <ScopedTheme theme="dark">
      {/* All children here use the dark theme regardless of app-level theme */}
      <View>
        <Text>Always dark</Text>
      </View>
    </ScopedTheme>
  )
}
```

Siblings of `<ScopedTheme>` are unaffected — context only propagates to descendants.

---

## Animated Theme (Reanimated)

Requires `react-native-reanimated` to be installed.

```typescript
import { useAnimatedTheme } from "@dripstyle/core"

import { useAnimatedStyle } from "react-native-reanimated"

function AnimatedCard() {
  const animatedTheme = useAnimatedTheme()

  const style = useAnimatedStyle(() => ({
    backgroundColor: animatedTheme.value.colors.card,
    borderColor: animatedTheme.value.colors.border,
  }))

  return <Animated.View style={style} />
}
```

`useAnimatedTheme()` returns a `SharedValue<Theme>` that updates when the active theme changes,
allowing smooth animated transitions inside `useAnimatedStyle` worklets.

---

## Color Utilities

Most color utilities accept any CSS color string and return `rgb(r, g, b)` / `rgba(r, g, b, a)`
strings. Functions marked ★ are declared with `"worklet"` and are safe inside Reanimated worklets.

```typescript
import {
  withOpacity,
  alpha,
  lighten,
  darken,
  mix,
  contrastColor,
  isLight,
  toHex,
  parseColor
} from "@dripstyle/core"

const styles = StyleSheet.create(({ theme }) => ({
  overlay: {
    // ★ worklet-safe
    backgroundColor: withOpacity(theme.colors.background, 0.8)
  },
  hover: {
    // ★ worklet-safe — LCH color space
    backgroundColor: lighten(theme.colors.primary, 0.1)
  },
  pressed: {
    // ★ worklet-safe — LCH color space
    backgroundColor: darken(theme.colors.primary, 0.1)
  }
}))

// Contrast-safe text color (not worklet-safe):
const textColor = contrastColor(backgroundColor) // "#000000" or "#ffffff"

// Convert to hex:
const hex = toHex("rgb(255, 0, 0)") // "#ff0000"

// Parse into components:
const { r, g, b, a } = parseColor("rgb(255, 0, 0)") // { r: 255, g: 0, b: 0, a: 1 }
```

| Function                      | Worklet | Description                                                     |
| ----------------------------- | ------- | --------------------------------------------------------------- |
| `withOpacity(color, opacity)` | ★       | Adds/replaces alpha channel; returns `rgba(...)`                |
| `alpha(color, opacity)`       | ★       | Alias for `withOpacity`                                         |
| `lighten(color, amount)`      | ★       | Lightens by `amount` (0–1) in the LCH color space               |
| `darken(color, amount)`       | ★       | Darkens by `amount` (0–1) in the LCH color space                |
| `mix(color1, color2, weight)` | ★       | Mixes in RGB space; `weight` 1 = all `color1`, 0 = all `color2` |
| `contrastColor(color)`        | —       | Returns `"#000000"` or `"#ffffff"` for WCAG contrast            |
| `isLight(color)`              | —       | Returns `true` if the color is perceptually light               |
| `toHex(color)`                | —       | Converts any CSS color string to a `#rrggbb` hex string         |
| `parseColor(color)`           | —       | Returns `{ r, g, b, a }` components (r/g/b: 0–255, a: 0–1)      |

---

## Runtime Values

`Runtime` provides synchronous access to device dimensions, platform, safe area insets, and the
active breakpoint — available before the React tree mounts.

```typescript
import { Runtime, useRuntime } from "@dripstyle/core"

// Static access — no re-renders, available anywhere:
const { width } = Runtime.screen
const platform = Runtime.platform

// Reactive — re-renders on dimension change:
function ResponsiveComponent() {
  const runtime = useRuntime()

  return (
    <Text>
      {runtime.breakpoint} — {runtime.window.width}×{runtime.window.height}
    </Text>
  )
}
```

`Runtime.insets` returns `{ top, right, bottom, left }` in pixels. If
`react-native-safe-area-context` is not installed, it returns zeros and emits a single DEV warning.
