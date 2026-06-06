# CLAUDE.md

**dripstyle** — type-safe React Native styling engine (monorepo: `@dripstyle/core`,
`@dripstyle/presets`, Expo demo).

## Commands

| Command             | Purpose                        |
| ------------------- | ------------------------------ |
| `pnpm build`        | Build all packages (tsup)      |
| `pnpm dev`          | Watch mode                     |
| `pnpm lint`         | ESLint on all packages         |
| `pnpm lint:fix`     | ESLint with auto-fix           |
| `pnpm format`       | Prettier --write               |
| `pnpm format:check` | Prettier --check               |
| `pnpm typecheck`    | `tsc --noEmit` in all packages |

Example app: `cd example && pnpm start` (or `pnpm android` / `pnpm ios` / `pnpm web`)

## Workspace Layout

```
packages/core/src/       @dripstyle/core — StyleSheet, hooks, variants, colors, runtime
packages/presets/src/    @dripstyle/presets — Tailwind-derived tokens, themes, breakpoints
example/                 Expo 54 demo app
```

Key files in `packages/core/src/`:

- `stylesheet.ts` — `StyleSheet.configure()` + `StyleSheet.create()`
- `context.tsx` — `ThemeProvider`
- `variants.ts` — `createVariant()`
- `hooks.ts` — `useStyles`, `useTheme`, `useAnimatedTheme`
- `runtime.ts` — `Runtime.*` (static) + `useRuntime()` (reactive)
- `colors.ts` — color utilities; some marked `"worklet"` (see worklets rule)
- `types.ts` — core types + `DripstyleThemes` / `DripstyleBreakpoints` augmentation interfaces

## Key Pattern: Module Augmentation

```typescript
declare module "@dripstyle/core" {
  interface DripstyleThemes extends typeof preset.themes {}
  interface DripstyleBreakpoints extends typeof preset.breakpoints {}
}
```

This is how consumers get full TypeScript inference across the entire API.

## Conventions

- **Package manager**: pnpm workspaces; build orchestrated via Turbo
- **Node**: >= 24.0.0 · **TypeScript**: strict, no unused locals/params
- **Formatting**: Prettier — no semicolons, double quotes, 100 char width, no trailing comma
- **Linting**: ESLint flat config + typescript-eslint. Unused vars ok if prefixed `_`
- **Commits**: conventional commits (`feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert`)
- **Build output**: ESM (`dist/index.js`) + CJS (`dist/index.cjs`) + types (`dist/index.d.ts`)
- **Optional peer deps**: `react-native-reanimated`, `react-native-safe-area-context` — core
  degrades gracefully without them

## Critical Rules

- NEVER import `@dripstyle/core` internals by file path. Use the package name only.
- NEVER add a hard `import` from optional peer deps. Guard with `try/require`.
- NEVER tag a function `"worklet"` if it calls culori — culori is not worklet-safe.
- NEVER change `DripstyleThemes` or `DripstyleBreakpoints` from `interface` to `type` — declaration
  merging requires `interface`.

## Rule References

@.claude/rules/code-style.md @.claude/rules/types.md @.claude/rules/imports.md
@.claude/rules/hooks.md @.claude/rules/testing.md @.claude/rules/security.md
@.claude/rules/package-api.md @.claude/rules/worklets.md
