import {
  createContext,
  Fragment,
  useCallback,
  useEffect,
  useReducer,
  type ComponentType,
  type ReactElement,
  type ReactNode
} from "react"

import { Appearance } from "react-native"

import { getStore, markProviderMounted, markProviderUnmounted, setStore, subscribe } from "./store"

import { updateInsets } from "./runtime"

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

/**
 * Carries the theme **name** a subtree is scoped to, separate from the theme value in
 * {@link ThemeContext}. `useStyles` reads it to resolve the right theme without subscribing to a
 * value that changes on every global theme switch — that decoupling is what lets selective
 * re-rendering work while {@link ScopedTheme} keeps overriding the theme for its subtree.
 *
 * Three states, distinguishable by `useStyles`:
 * - `undefined` (the default) — no `<ThemeProvider>` above; `useStyles` throws in DEV.
 * - `null` — inside a provider, unscoped; resolve the active theme from the store.
 * - a theme name — inside a `<ScopedTheme>`; resolve that theme from the store.
 *
 * The provider supplies a stable `null`, so a global theme change never re-renders a consumer
 * through this context. Internal; not exported from the package barrel.
 */
const ScopedThemeContext = createContext<ThemeName | null | undefined>(undefined)

type Insets = { top: number; right: number; bottom: number; left: number }

type SafeAreaMetrics = {
  insets: Insets
  frame: { x: number; y: number; width: number; height: number }
}

let SafeAreaProvider: ComponentType<{
  children: ReactNode
  initialMetrics?: SafeAreaMetrics | null
}> | null = null
let useSafeAreaInsets: (() => Insets) | null = null

// Real window safe-area metrics, available synchronously from a native constant (null on web/tests).
let initialWindowMetrics: SafeAreaMetrics | null = null

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const safeArea = require("react-native-safe-area-context")

  SafeAreaProvider = safeArea.SafeAreaProvider
  useSafeAreaInsets = safeArea.useSafeAreaInsets
  initialWindowMetrics = safeArea.initialWindowMetrics ?? null
} catch {
  // Not installed — insets default to zeros
}

// Seed the global insets synchronously from the native window metrics the moment this module loads,
// before any provider mounts. Keeps `Runtime.insets` correct regardless of where `SafeAreaProvider`
// sits in the tree (a nested navigator can otherwise measure zeros) and gives the first render real
// values instead of zeros. No-ops on web and in tests, where `initialWindowMetrics` is null.
if (initialWindowMetrics) {
  updateInsets(initialWindowMetrics.insets)
}

function InsetSync({ children }: { children: ReactNode }): ReactElement {
  const measuredInsets = useSafeAreaInsets!()

  // A nested navigator (expo-router / react-navigation) can spin up its own SafeAreaProvider, leaving
  // this provider reporting zeros even on devices that genuinely have safe areas. When the measured
  // insets are all zero, fall back to the synchronous native window metrics so `Runtime.insets`
  // reflects the real device insets instead of being stuck at 0.
  const hasMeasuredInsets =
    measuredInsets.top > 0 ||
    measuredInsets.right > 0 ||
    measuredInsets.bottom > 0 ||
    measuredInsets.left > 0

  const insets =
    hasMeasuredInsets || !initialWindowMetrics ? measuredInsets : initialWindowMetrics.insets

  useEffect(() => {
    updateInsets(insets)
  }, [insets.top, insets.right, insets.bottom, insets.left])

  return <Fragment>{children}</Fragment>
}

/**
 * Resolves the active (unscoped) theme name from the store: an explicit `activeThemeName`, else the
 * adaptive light/dark match, else the first registered theme. Returns `null` when nothing is
 * registered. Shared by {@link ThemeProvider} and the `useStyles` tracking path so both agree.
 */
export function resolveActiveThemeName(): ThemeName | null {
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

/** Resolves the active (unscoped) theme object, falling back to an empty theme. */
export function resolveActiveTheme(): Theme {
  const name = resolveActiveThemeName()

  if (!name) return {} as Theme

  return (getStore().registeredThemes[name] as Theme) ?? ({} as Theme)
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

  if (!store.isProviderMounted) {
    // Mark synchronously during render, not only in the mount effect, so the first render of
    // descendant components already observes `isProviderMounted === true` and legitimate inset
    // access never trips the pre-mount warning. The effect below keeps the flag correct across
    // StrictMode's mount/unmount/remount cycle and real unmounts.
    markProviderMounted()
  }

  useEffect(() => {
    markProviderMounted()

    return () => {
      markProviderUnmounted()
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

  const themeName = resolveActiveThemeName()
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

  const content = (
    <ThemeContext.Provider value={value}>
      <ScopedThemeContext.Provider value={null}>{children}</ScopedThemeContext.Provider>
    </ThemeContext.Provider>
  )

  if (SafeAreaProvider) {
    const inner = useSafeAreaInsets ? <InsetSync>{content}</InsetSync> : content

    // Pass `initialMetrics` so the provider exposes real safe-area insets synchronously on the first
    // render. Without it the context is `null` until an async native measurement, which makes a
    // nested navigator (expo-router / react-navigation) spin up its own SafeAreaProvider — leaving
    // this one stuck reporting zeros to `InsetSync`. See react-native-safe-area-context docs.
    return <SafeAreaProvider initialMetrics={initialWindowMetrics}>{inner}</SafeAreaProvider>
  }

  return content
}

export { ScopedThemeContext, ThemeContext, ThemeProvider, type ThemeContextValue }
