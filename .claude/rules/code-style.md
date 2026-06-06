---
paths:
  - "packages/**/*.ts"
  - "packages/**/*.tsx"
  - "example/**/*.ts"
  - "example/**/*.tsx"
---

# Code Style Rules

## Early Returns

Always prefer early returns to reduce nesting. Exit as soon as a condition is met.

```ts
// ✓
const resolve = (value: unknown) => {
  if (!value) return fallback

  return compute(value)
}

// ✗
const resolve = (value: unknown) => {
  if (value) {
    return compute(value)
  } else {
    return fallback
  }
}
```

## Blank Lines Between Logical Groups

Separate logically distinct statements with a blank line. Group only tightly coupled items (e.g. two
state variables that always change together). A blank line is required after the last early-return
guard before the main logic body.

## Hook Declaration Order in Components

Declare hooks and derived values in this order, with a blank line between each group:

1. `useState` / `useReducer`
2. `useRef`
3. Custom hooks (`useStyles`, `useTheme`, `useRuntime`, etc.)
4. Derived constants from the above
5. `useEffect` / `useCallback` / `useMemo`

## Naming — No Abbreviations

Always use full, descriptive names for parameters, callbacks, and array method arguments. Never use
single-letter shorthands.

```ts
// ✓
themes.map((theme) => theme.name)
colors.filter((color) => color.startsWith("rgb"))
values.reduce((accumulator, value) => accumulator + value, 0)

// ✗
themes.map((t) => t.name)
colors.filter((c) => c.startsWith("rgb"))
values.reduce((acc, val) => acc + val, 0)
```

Exception: loop indices (`i`, `j`) in `for` loops are acceptable.

## Booleans

Boolean variables and props use `is`, `has`, `can`, or `should` as a prefix.

```ts
// ✓
;(isPortrait, hasTheme, canAnimate, shouldResolve)

// ✗
;(portrait, theme, animatable, resolve)
```

## Event Handlers

Props that accept a callback use `on` + event name. Handlers defined inside a component use
`handle` + event name.

```ts
// ✓ - prop
<ThemeProvider onThemeChange={handleThemeChange} />

// ✓ - internal handler
const handleThemeChange = (name: string) => { ... }
```
