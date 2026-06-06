# Changelog

All notable changes to `@dripstyle/core` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.5] - 2026-06-06

### Fixed

- Static and inline-function stylesheet entries are now contextually typed as React Native styles,
  the same way variant options already were: bare objects and inline-function return objects get
  full property autocomplete, keep their literal values without `as const`, and have their property
  values type-checked. Previously these entries carried no per-property typing — an unknown key
  surfaced as `any` instead of being flagged.
- Corrected the module augmentation example in the README to use the actual `DripstyleThemes` and
  `DripstyleBreakpoints` interfaces (the documented `Register` interface did not exist).

### Changed

- `createVariant()` now pins its return type to the computed variant style instead of exposing a
  free third type parameter. Variant entries keep their concrete style and stay assignable to
  `StyleProp<ViewStyle>` even when declared inside a `StyleSheet.create()` factory. The rarely-used
  third type argument is no longer accepted.

## [1.2.4] - 2026-06-04

### Fixed

- Keep `createVariant()` entries callable inside stylesheet factories that also contain inline
  function entries. Variant return unions are now validated as a whole instead of being split into
  individual literal members, avoiding failed `StyleSheet.create()` overload resolution and
  downstream `unknown` / `never` inference in consumer components.
- Keep direct factory style objects assignable to React Native `style` props without requiring
  `as const` or `viewStyle()`, while still rejecting invalid literal values for known style
  properties.

## [1.2.3] - 2026-06-04

### Fixed

- Preserve concrete return types for inline function stylesheet entries while still validating them
  as React Native styles. Function entries such as `value: (props) => ({ color, fontWeight })` now
  stay assignable to `StyleProp<TextStyle>`, and view style functions stay assignable to
  `StyleProp<ViewStyle>` instead of widening to `ViewStyle | TextStyle | ImageStyle`.
- Declare optional native integrations in `peerDependencies` instead of only `peerDependenciesMeta`,
  so package managers can resolve installed `react-native-reanimated` and
  `react-native-safe-area-context` peers from app workspaces.

## [1.2.2] - 2026-06-04

### Added

- Type-level regression tests for variant style return inference. They assert that
  `VariantStyleType<V>` unions every concrete variant style across non-overlapping dimensions
  instead of collapsing to the `ViewStyle | TextStyle | ImageStyle` fallback, and that a variant
  result stays assignable to `StyleProp<ViewStyle>` / `StyleProp<TextStyle>` through
  `StyleSheet.create()` and `useStyles()`.

## [1.2.1] - 2026-06-04

### Fixed

- `VariantStyleType<V>` no longer collapses to the `ViewStyle | TextStyle | ImageStyle` fallback
  when variant dimensions have non-overlapping keys. The previous flat index access reduced to
  `never` (`keyof` of a union is the intersection of each member's keys), so a per-dimension mapped
  type now unions every concrete variant style and restores specific inference at the call site.

## [1.2.0] - 2026-06-04

### Added

- Inline function styles: a `StyleSheet.create()` entry can now be a function with your own
  arguments that returns a style object — `card: (selected: boolean) => ({ ... })`, called as
  `styles.card(selected)`. The function closes over `theme`/`runtime` from the factory, its returned
  object is contextually typed as a style (invalid properties are flagged, no wrapper required), and
  its full call signature is preserved through `useStyles()`.
- Optional `viewStyle()`, `textStyle()`, and `imageStyle()` identity helpers — opt into autocomplete
  and property-pinpointed errors _inside_ an inline function's returned object. Never required.

### Changed

- Function entries in a stylesheet factory are now passed through untouched and stay callable. Only
  static object entries are registered with `RN.StyleSheet`; inline functions and `createVariant()`
  results are never invoked or re-processed during `useStyles()`. This removes the implicit per-key
  `(ctx) => style` auto-resolution in favor of accessing `theme`/`runtime` via closure.

## [1.1.1] - 2026-06-03

### Fixed

- Avoid a false DEV warning when `useStyles()` reads `Runtime.insets` during the first render under
  `<ThemeProvider>`.
- Keep `useRuntime()` consumers reactive when safe area insets and runtime environment values
  change.

## [1.1.0] - 2026-05-05

### Added

- `ThemeProvider` now integrates with `react-native-safe-area-context` to expose safe area insets
  via `Runtime` and `useRuntime()`
- `resetStore()` utility function for resetting global store state (useful in tests)
- Vitest test suite covering colors, variants, responsive, and store modules
- Type-level tests for public API TypeScript inference

### Fixed

- Removed incorrect `"worklet"` directives from `lighten()`, `darken()`, and `mix()` — these call
  culori and are not worklet-safe
- `createVariant()` type signature now preserves specific inferred style types instead of widening
  to `StyleProp<ViewStyle>`

## [1.0.0] - 2026-02-26

### Added

- `StyleSheet.configure()` for app-level theme and settings initialization
- `StyleSheet.create()` as a drop-in superset of `RN.StyleSheet` with factory function support
- `ThemeProvider` and `ScopedTheme` for theme context management
- `useStyles()`, `useTheme()` hooks for reactive theme consumption
- `useAnimatedTheme()` for Reanimated-powered animated theme transitions
- `createVariant()` with Map-based result caching and boolean variant support
- `StyleVariants<T, K>` type utility for extracting variant props
- `responsive()` helper with breakpoint cascade
- `Runtime` (static) and `useRuntime()` (reactive) for dimensions, platform, breakpoint, and safe
  area insets
- Color utilities: `withOpacity`, `alpha`, `lighten`, `darken`, `mix`, `contrastColor`, `isLight`,
  `toHex`, `parseColor`
- `Register` interface for module augmentation and full TypeScript inference
- Optional peer dependencies: `react-native-reanimated`, `react-native-safe-area-context`
