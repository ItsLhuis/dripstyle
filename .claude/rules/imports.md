---
paths:
  - "packages/**/*.ts"
  - "packages/**/*.tsx"
  - "example/**/*.ts"
  - "example/**/*.tsx"
---

# Import Rules

## Group Order

Imports are organized into four groups separated by a blank line, in this order:

1. **React / React Native** — `react`, `react-native`, `expo-*`
2. **External packages** — any package from `node_modules`, alphabetical
3. **Monorepo packages** — `@dripstyle/*`, alphabetical
4. **Relative** — paths starting with `./` or `../`

Type-only imports stay inline with value imports using the `type` modifier. They are not grouped
separately.

Within each group, sort alphabetically.

## Canonical Example

```ts
// ✓
import { useEffect, useState } from "react"

import { View } from "react-native"

import { culoriConverter } from "culori"

import { useStyles, useTheme, type StyleVariants } from "@dripstyle/core"
import { preset } from "@dripstyle/presets"

import { buttonStyles } from "./buttonStyles"
```

```ts
// ✗ — groups mixed, no blank-line separation
import { buttonStyles } from "./buttonStyles"
import { useStyles } from "@dripstyle/core"
import { useEffect } from "react"
import type { StyleVariants } from "@dripstyle/core"
```
