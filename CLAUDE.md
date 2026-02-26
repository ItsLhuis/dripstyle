# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Project Overview

**dripstyle** is a type-safe React Native styling engine. Monorepo with three workspaces:

- **`packages/core`** (`@dripstyle/core`): Styling engine — StyleSheet API, theme context, variant
  system, runtime hooks, color utilities
- **`packages/presets`** (`@dripstyle/presets`): Design system presets (currently Tailwind-based
  tokens/themes)
- **`example/`**: Expo 54 demo app

## Commands

| Command             | Purpose                             |
| ------------------- | ----------------------------------- |
| `pnpm build`        | Build all packages (tsup → `dist/`) |
| `pnpm dev`          | Watch mode (tsup --watch)           |
| `pnpm lint`         | ESLint on all packages              |
| `pnpm lint:fix`     | ESLint with auto-fix                |
| `pnpm format`       | Prettier --write                    |
| `pnpm format:check` | Prettier --check                    |
| `pnpm typecheck`    | `tsc --noEmit` in all packages      |

Example app: `cd example && pnpm start` (or `pnpm android`/`pnpm ios`/`pnpm web`)

Build orchestration via **Turbo** — tasks respect topological dependency order (`^build`).

## Architecture

### Core Engine (`packages/core/src/`)

- **`stylesheet.ts`**: `StyleSheet.configure()` (app init) and `StyleSheet.create()` (style
  definitions). Plain objects → immediate RN StyleSheet IDs. Factory functions → lazy evaluation
  with theme/runtime context.
- **`context.tsx`**: `ThemeProvider` — manages active theme, color scheme, provides context to
  `useStyles`/`useTheme`.
- **`variants.ts`**: `createVariant()` — map-based cached variant system. Boolean variants
  auto-typed as booleans in component props.
- **`hooks.ts`**: `useStyles()`, `useTheme()`, `useAnimatedTheme()` — reactive hooks that re-render
  on theme changes.
- **`runtime.ts`**: `Runtime.*` (static) and `useRuntime()` (reactive) — dimensions, breakpoint,
  platform, safe area insets.
- **`store.ts`**: Internal state management for theme/runtime.
- **`colors.ts`**: Color utilities (`withOpacity`, `alpha`, `lighten`, `darken`, `mix`, etc.) — many
  are worklet-safe.
- **`responsive.ts`**: Responsive helpers tied to breakpoint tokens.
- **`types.ts`**: Core type definitions. `Register` interface for module augmentation (provides full
  TypeScript inference for themes/breakpoints).

### Presets (`packages/presets/src/tailwind/`)

Tailwind-derived design tokens: `palette.ts` (colors), `tokens.ts` (spacing, typography, etc.),
`themes.ts` (light/dark), `accessors.ts` (typed token lookup). Exports a `preset` object with
`themes` and `breakpoints`.

### Key Pattern: Module Augmentation

```typescript
declare module "@dripstyle/core" {
  interface Register {
    themes: typeof preset.themes
    breakpoints: typeof preset.breakpoints
  }
}
```

This gives full type inference across the entire styling API.

## Conventions

- **Package manager**: pnpm 10.23.0 (workspaces)
- **Node**: >= 24.0.0
- **TypeScript**: Strict mode, no unused locals/params
- **Formatting**: Prettier — no semicolons, double quotes, 100 char width, trailing comma: none
- **Linting**: ESLint flat config, typescript-eslint. Unused vars ok if prefixed `_`.
- **Commits**: Conventional commits enforced via commitlint
  (`feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert`)
- **Pre-commit**: Husky runs lint-staged (ESLint fix + Prettier on staged files)
- **Build output**: ESM (`dist/index.js`) + CJS (`dist/index.cjs`) + types (`dist/index.d.ts`)
- **Optional peer deps**: `react-native-reanimated` (animated themes),
  `react-native-safe-area-context` (insets) — core degrades gracefully without them
