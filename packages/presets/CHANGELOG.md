# Changelog

All notable changes to `@dripstyle/presets` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-26

### Added

- Tailwind v4 preset (`@dripstyle/presets/tailwind`) with full color palette, semantic light/dark themes, and token accessor library
- `preset.themes` with `light` and `dark` themes ready to pass to `StyleSheet.configure()`
- `preset.breakpoints` with Tailwind-derived breakpoint tokens (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`)
- Token accessor library: `theme.colors.*`, `theme.space()`, `theme.fontSize()`, `theme.fontWeight()`, `theme.radius()`, and more
- Raw Tailwind v4 color `palette` export
