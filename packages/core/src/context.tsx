import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  type ComponentType,
  type ReactElement,
  type ReactNode
} from "react"

import { Appearance } from "react-native"

import { getStore, setStore, subscribe } from "./store"

import type { Theme, ThemeName } from "./types"

declare const __DEV__: boolean

function normalizeColorScheme(
  scheme: "light" | "dark" | "unspecified" | null | undefined
): "light" | "dark" | null {
  if (scheme === "light" || scheme === "dark") return scheme

  return null
}

/**
 * Value exposed by `ThemeContext` and consumed by `useTheme()`.
 *
 * Contains the resolved theme, active theme name, and imperative
 * controls for switching themes or toggling adaptive mode.
 */
type ThemeContextValue = {
  theme: Theme
  themeName: ThemeName
  setTheme: (name: ThemeName) => void
  setAdaptiveThemes: (enabled: boolean) => void
  hasAdaptiveThemes: boolean
  colorScheme: "light" | "dark" | null
}

function throwNoProvider(): never {
  throw new Error(
    "[dripstyle] useTheme() / useStyles() must be called inside <ThemeProvider>. " +
      "Wrap your app root with <ThemeProvider>."
  )
}

/**
 * React Context that carries theme state through the component tree.
 *
 * The default value throws a DEV error when accessed outside `<ThemeProvider>`,
 * guiding developers to wrap their app root correctly.
 */
const ThemeContext = createContext<ThemeContextValue>({
  get theme(): Theme {
    if (__DEV__) throwNoProvider()
    return {} as Theme
  },
  get themeName(): ThemeName {
    if (__DEV__) throwNoProvider()
    return "" as ThemeName
  },
  setTheme() {
    if (__DEV__) throwNoProvider()
  },
  setAdaptiveThemes() {
    if (__DEV__) throwNoProvider()
  },
  get hasAdaptiveThemes(): boolean {
    if (__DEV__) throwNoProvider()
    return false
  },
  get colorScheme(): "light" | "dark" | null {
    if (__DEV__) throwNoProvider()
    return null
  }
} satisfies ThemeContextValue)

let SafeAreaProvider: ComponentType<{ children: ReactNode }> | null = null

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const safeArea = require("react-native-safe-area-context")
  SafeAreaProvider = safeArea.SafeAreaProvider
} catch {
  // Not installed — insets default to zeros
}

function resolveThemeName(): ThemeName | null {
  const store = getStore()

  if (store.activeThemeName) return store.activeThemeName as ThemeName

  if (store.adaptiveThemes) {
    const scheme = normalizeColorScheme(Appearance.getColorScheme())
    const name = scheme === "dark" ? "dark" : "light"

    if (store.registeredThemes[name]) return name as ThemeName
  }

  const names = Object.keys(store.registeredThemes)

  return names.length > 0 ? (names[0] as ThemeName) : null
}

/**
 * Provides theme context to the component tree. Accepts zero configuration props.
 *
 * All configuration is done via `StyleSheet.configure()` before this component mounts.
 * When `react-native-safe-area-context` is installed, children are automatically
 * wrapped with `SafeAreaProvider`.
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
const ThemeProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [, forceUpdate] = useReducer((c: number) => c + 1, 0)

  const store = getStore()

  useEffect(() => {
    setStore({ isProviderMounted: true })

    return () => {
      setStore({ isProviderMounted: false })
    }
  }, [])

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      forceUpdate()
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!store.adaptiveThemes) return undefined

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      const currentStore = getStore()

      if (currentStore.adaptiveThemes) {
        const name = colorScheme === "dark" ? "dark" : "light"

        if (currentStore.registeredThemes[name]) {
          setStore({ activeThemeName: name })
        }
      }
    })

    return () => {
      subscription.remove()
    }
  }, [store.adaptiveThemes])

  const themeName = resolveThemeName()
  const theme = themeName ? (store.registeredThemes[themeName] as Theme) : ({} as Theme)
  const colorScheme = normalizeColorScheme(Appearance.getColorScheme())

  const setTheme = useCallback((name: ThemeName) => {
    const currentStore = getStore()

    if (__DEV__ && currentStore.adaptiveThemes) {
      console.warn(
        "[dripstyle] setTheme() called while adaptiveThemes is enabled. " +
          "Disable adaptive themes first with setAdaptiveThemes(false)."
      )
    }

    setStore({ activeThemeName: name })
  }, [])

  const setAdaptiveThemes = useCallback((enabled: boolean) => {
    setStore({ adaptiveThemes: enabled })

    if (enabled) {
      const scheme = normalizeColorScheme(Appearance.getColorScheme())
      const name = scheme === "dark" ? "dark" : "light"

      setStore({ activeThemeName: name })
    }
  }, [])

  const value: ThemeContextValue = {
    theme,
    themeName: themeName ?? ("" as ThemeName),
    setTheme,
    setAdaptiveThemes,
    hasAdaptiveThemes: store.adaptiveThemes,
    colorScheme
  }

  const content = <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>

  if (SafeAreaProvider) {
    return <SafeAreaProvider>{content}</SafeAreaProvider>
  }

  return content
}

export { ThemeContext, ThemeProvider, type ThemeContextValue }
