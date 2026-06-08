import { useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react"

import {
  resolveActiveTheme,
  ScopedThemeContext,
  ThemeContext,
  type ThemeContextValue
} from "./context"
import { createTrackingContext, DEPENDENCY_KEYS, type DependencyKey } from "./dependencies"
import { processStyleSheet } from "./processing"
import { subscribe as subscribeBus } from "./reactivity"
import { Runtime } from "./runtime"
import { getStore } from "./store"

import type {
  ProcessedStyleSheet,
  RuntimeValues,
  StyleSheetDefinition,
  Theme,
  ThemeName
} from "./types"

declare const __DEV__: boolean

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
 * Returns processed styles for a stylesheet definition with dependency-based selective
 * re-rendering.
 *
 * The component re-renders only when a theme/runtime value the stylesheet **actually reads**
 * changes:
 *
 * - **Plain-object stylesheets** record no dependency and never re-render on a theme or runtime
 *   change — they are returned as-is with referential stability.
 * - **Factory stylesheets** run against tracking proxies that record which coarse dependencies
 *   (`theme`, `dimensions`, `insets`, `colorScheme`, `reduceMotion`) they touch, then subscribe to
 *   exactly those. A factory reading only `theme` ignores resize/inset/color-scheme events; one
 *   reading only `runtime.insets` ignores theme changes. Inline style functions and `createVariant`
 *   configs contribute their dependencies too, accumulated across renders.
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
  const dependenciesRef = useRef<Set<DependencyKey> | null>(null)
  const versionRef = useRef(0)
  const lastStylesheetRef = useRef<T>(stylesheet)

  const scopedThemeName = useContext(ScopedThemeContext)

  const isStatic = typeof stylesheet !== "function"

  if (!dependenciesRef.current || lastStylesheetRef.current !== stylesheet) {
    dependenciesRef.current = new Set()
    lastStylesheetRef.current = stylesheet
  }

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (isStatic) return () => {}

      return subscribeBus(DEPENDENCY_KEYS, (key) => {
        if (!dependenciesRef.current?.has(key)) return

        versionRef.current += 1
        onStoreChange()
      })
    },
    [isStatic]
  )

  const version = useSyncExternalStore(
    subscribe,
    () => versionRef.current,
    () => versionRef.current
  )

  return useMemo(() => {
    if (__DEV__ && scopedThemeName === undefined) {
      throw new Error(
        "[dripstyle] useStyles() must be called inside <ThemeProvider>. " +
          "Wrap your app root with <ThemeProvider>."
      )
    }

    if (typeof stylesheet !== "function") {
      return stylesheet as unknown as ProcessedStyleSheet<T>
    }

    const realTheme =
      scopedThemeName === null || scopedThemeName === undefined
        ? resolveActiveTheme()
        : ((getStore().registeredThemes[scopedThemeName] as Theme) ?? ({} as Theme))

    const trackingContext = createTrackingContext((key) => dependenciesRef.current?.add(key), {
      theme: realTheme,
      runtime: Runtime as unknown as RuntimeValues
    })

    return processStyleSheet(stylesheet, trackingContext)
  }, [stylesheet, version, scopedThemeName])
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
