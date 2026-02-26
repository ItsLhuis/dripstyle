# dripstyle

**dripstyle** is a pure, type-safe React Native styling engine built for teams that want full
control over their design system — without being locked into any particular set of tokens or visual
opinions.

## Why dripstyle?

Most React Native styling solutions come bundled with a fixed set of colors, spacing scales, and
design decisions. dripstyle separates the engine from the tokens: the core library handles themes,
variants, responsive utilities, and runtime values, while presets supply the actual design tokens.
You can use an official preset, build your own, or mix both.

## How does it work?

dripstyle is made up of two layers:

- **Core** (`@dripstyle/core`): The styling engine. Provides a drop-in superset of
  `RN.StyleSheet`, a theme system with full TypeScript inference, a variant system with result
  caching, color utilities, responsive helpers, and a runtime object for dimensions and safe area
  insets. Zero design tokens included.

- **Presets** (`@dripstyle/presets`): Optional design system packages that plug into core. Each
  preset supplies a theme object (light, dark, or any number of named themes), a token accessor
  library, and optionally a raw color palette. The official Tailwind v4 preset is included out of
  the box.

## Key Features

- **Drop-in StyleSheet**: `StyleSheet.create()` is a superset of the React Native API — plain
  objects behave identically, factory functions unlock theme access.
- **Type-safe themes**: Augment the `Register` interface once and every `theme.*` access is
  fully typed throughout the codebase.
- **Variant system**: `createVariant()` with Map-based result caching, boolean variant support,
  and `StyleVariants<T, K>` type extraction for component props.
- **Responsive utilities**: `responsive()` helper with a breakpoint cascade and runtime screen
  dimensions.
- **Color utilities**: `lighten`, `darken`, `mix`, `withOpacity`, `contrastColor`, and more —
  most declared as Reanimated worklets.
- **Animated themes**: `useAnimatedTheme()` returns a `SharedValue<Theme>` for smooth animated
  transitions inside `useAnimatedStyle`.
- **Optional dependencies**: Reanimated and `react-native-safe-area-context` are both optional —
  the engine degrades gracefully if either is absent.
- **Preset system**: Swap or extend the design system without touching the engine.

## Project Structure

This monorepo includes:

- [`@dripstyle/core`](packages/core/README.md): The styling engine — no design opinions included.
- [`@dripstyle/presets`](packages/presets/README.md): Official design system presets.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
