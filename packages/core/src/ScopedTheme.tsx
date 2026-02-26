import { useContext, type ReactElement, type ReactNode } from "react"

import { ThemeContext, type ThemeContextValue } from "./context"

import { getStore } from "./store"

import type { Theme, ThemeName } from "./types"

declare const __DEV__: boolean

type ScopedThemeProps = {
  theme: ThemeName
  children: ReactNode
}

/**
 * Overrides the active theme for a subtree without affecting siblings or ancestors.
 *
 * @example
 * ```tsx
 * <ScopedTheme theme="midnight">
 *   <BottomSheet />
 * </ScopedTheme>
 * ```
 */
const ScopedTheme = ({ theme: themeName, children }: ScopedThemeProps): ReactElement => {
  const parentContext = useContext(ThemeContext)

  const store = getStore()

  const theme = store.registeredThemes[themeName]

  if (__DEV__ && !theme) {
    const available = Object.keys(store.registeredThemes).join(", ") || "(none registered)"

    throw new Error(
      `[dripstyle] <ScopedTheme theme="${String(themeName)}"> — theme not found. ` +
        `Available themes: ${available}. ` +
        `Register themes via StyleSheet.configure({ themes: { ... } }).`
    )
  }

  const scopedValue: ThemeContextValue = {
    ...parentContext,
    theme: theme as Theme,
    themeName
  }

  return <ThemeContext.Provider value={scopedValue}>{children}</ThemeContext.Provider>
}

export { ScopedTheme }
