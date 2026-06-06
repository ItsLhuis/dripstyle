import { useContext, useEffect, useMemo } from "react"

import { ThemeContext, type ThemeContextValue } from "./context"

import { processStyleSheet } from "./processing"

import { useRuntime } from "./runtime"

import type { ProcessedStyleSheet, StyleSheetDefinition, Theme, ThemeName } from "./types"

type SharedValue<T> = { value: T }

type ReanimatedModule = {
  useSharedValue: <T>(value: T) => SharedValue<T>
}

let reanimated: ReanimatedModule | null = null
let didResolveReanimated = false

function resolveReanimated(): ReanimatedModule | null {
  if (reanimated || didResolveReanimated) return reanimated

  didResolveReanimated = true

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    reanimated = require("react-native-reanimated") as ReanimatedModule
  } catch {
    // react-native-reanimated not installed or not resolvable from this package boundary
  }

  return reanimated
}

type UseThemeReturn = {
  theme: Theme
  themeName: ThemeName
  setTheme: (name: ThemeName) => void
  setAdaptiveThemes: (enabled: boolean) => void
  hasAdaptiveThemes: boolean
  colorScheme: "light" | "dark" | null
}

/**
 * Returns the current theme, theme name, and imperative controls
 * for switching themes or toggling adaptive mode.
 *
 * Must be called inside `<ThemeProvider>`.
 *
 * @example
 * ```ts
 * const { theme, themeName, setTheme } = useTheme()
 * ```
 */
export function useTheme(): UseThemeReturn {
  const context: ThemeContextValue = useContext(ThemeContext)

  return context
}

/**
 * Returns processed styles for a stylesheet definition, reacting to theme changes.
 *
 * Plain-object stylesheets (no factory function) never trigger re-renders on
 * theme change. Factory stylesheets re-process only when theme or runtime changes.
 *
 * Must be called inside `<ThemeProvider>`.
 *
 * @example
 * ```ts
 * const styles = useStyles(myStylesheet)
 * styles.container // ViewStyle
 * ```
 */
export function useStyles<T extends StyleSheetDefinition>(stylesheet: T): ProcessedStyleSheet<T> {
  const { theme } = useContext(ThemeContext)

  const runtime = useRuntime()

  return useMemo(() => {
    return processStyleSheet(stylesheet, { theme, runtime })
  }, [stylesheet, theme, runtime])
}

/**
 * Returns a Reanimated `SharedValue<Theme>` that updates whenever
 * the active theme changes. Use inside `useAnimatedStyle` worklets
 * to animate theme transitions on the UI thread.
 *
 * Requires `react-native-reanimated` as an optional peer dependency.
 *
 * @example
 * ```ts
 * const animatedTheme = useAnimatedTheme()
 *
 * const style = useAnimatedStyle(() => ({
 *   backgroundColor: animatedTheme.value.colors.primary,
 * }))
 * ```
 */
export function useAnimatedTheme(): SharedValue<Theme> {
  const reanimatedModule = resolveReanimated()

  if (!reanimatedModule) {
    throw new Error(
      "[dripstyle] useAnimatedTheme() requires react-native-reanimated. " +
        "Install it: npm install react-native-reanimated react-native-worklets"
    )
  }

  const { theme } = useContext(ThemeContext)

  const { useSharedValue } = reanimatedModule

  const sharedTheme: SharedValue<Theme> = useSharedValue(theme)

  useEffect(() => {
    sharedTheme.value = theme
  }, [theme, sharedTheme])

  return sharedTheme
}

export type { UseThemeReturn }
