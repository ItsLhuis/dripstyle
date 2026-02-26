# Changelog

All notable changes to `@dripstyle/core` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- `Runtime` (static) and `useRuntime()` (reactive) for dimensions, platform, breakpoint, and safe area insets
- Color utilities: `withOpacity`, `alpha`, `lighten`, `darken`, `mix`, `contrastColor`, `isLight`, `toHex`, `parseColor`
- `Register` interface for module augmentation and full TypeScript inference
- Optional peer dependencies: `react-native-reanimated`, `react-native-safe-area-context`
