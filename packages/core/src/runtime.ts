import { useEffect, useMemo, useReducer } from "react"

import {
  AccessibilityInfo,
  Appearance,
  Dimensions,
  I18nManager,
  PixelRatio,
  Platform,
} from "react-native"

import { getStore, setStore } from "./store"

import type { BreakpointName, RuntimeValues } from "./types"

declare const __DEV__: boolean

function computeBreakpoint(width: number): BreakpointName {
  const breakpoints = getStore().breakpoints
  const keys = Object.keys(breakpoints).sort((a, b) => breakpoints[a]! - breakpoints[b]!)

  let current = (keys[0] ?? "") as BreakpointName

  for (const key of keys) {
    if (width >= breakpoints[key]!) {
      current = key as BreakpointName
    }
  }

  return current
}

let _insets = { top: 0, right: 0, bottom: 0, left: 0 }
let _insetsWarningEmitted = false

/** Updates safe area insets. Called by `ThemeProvider` when `SafeAreaProvider` reports values. */
export function updateInsets(insets: { top: number; right: number; bottom: number; left: number }): void {
  _insets = insets
}

let _reduceMotion = false

AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
  _reduceMotion = enabled
})

AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled: boolean) => {
  _reduceMotion = enabled
})

Dimensions.addEventListener("change", () => {
  // Runtime getters read live values from RN APIs; listener kept for future cached state updates
})

/**
 * Singleton providing synchronous access to device and environment information.
 *
 * All dimension/device getters read live values from React Native APIs.
 * Safe area insets default to zeros until `<ThemeProvider>` mounts.
 */
export const Runtime = {
  get window() {
    return Dimensions.get("window")
  },

  get screen() {
    return Dimensions.get("screen")
  },

  get insets() {
    if (__DEV__ && !getStore().isProviderMounted && !_insetsWarningEmitted) {
      _insetsWarningEmitted = true
      console.warn(
        "[dripstyle] Runtime.insets accessed before <ThemeProvider> mounted. " +
          "Insets default to zeros. Access insets inside components wrapped by ThemeProvider."
      )
    }

    return _insets
  },

  get statusBar() {
    return { height: _insets.top }
  },

  get navigationBar() {
    return { height: _insets.bottom }
  },

  get orientation(): "portrait" | "landscape" {
    const { width, height } = Dimensions.get("window")

    return height >= width ? "portrait" : "landscape"
  },

  get isPortrait() {
    return this.orientation === "portrait"
  },

  get isLandscape() {
    return this.orientation === "landscape"
  },

  get breakpoint() {
    return computeBreakpoint(Dimensions.get("window").width)
  },

  get breakpoints() {
    return getStore().breakpoints
  },

  get pixelRatio() {
    return PixelRatio.get()
  },

  get fontScale() {
    return PixelRatio.getFontScale()
  },

  get platform() {
    return Platform.OS
  },

  get colorScheme(): "light" | "dark" | null {
    const scheme = Appearance.getColorScheme()
    if (scheme === "light" || scheme === "dark") return scheme

    return null
  },

  get isRTL() {
    return I18nManager.isRTL
  },

  get reduceMotion() {
    return _reduceMotion
  },

  get contentSizeCategory(): string | null {
    if (Platform.OS !== "ios") return null

    const info = AccessibilityInfo as unknown as Record<string, unknown>

    return typeof info.preferredTextSize === "string" ? info.preferredTextSize : null
  },

  setTheme(name: string): void {
    setStore({ activeThemeName: name })
  },

  updateTheme(name: string, updater: (current: unknown) => unknown): void {
    const store = getStore()

    const current = store.registeredThemes[name]

    if (current !== undefined) {
      setStore({
        registeredThemes: {
          ...store.registeredThemes,
          [name]: updater(current),
        },
      })
    }
  },

  getTheme(name: string): unknown {
    return getStore().registeredThemes[name]
  },

  setAdaptiveThemes(enabled: boolean): void {
    setStore({ adaptiveThemes: enabled })
  },

  setRootViewBackgroundColor(_color: string): void {
    if (__DEV__) {
      console.warn("[dripstyle] Runtime.setRootViewBackgroundColor() requires native integration.")
    }
  },
} as const

/**
 * Reactive hook that returns current runtime values and re-renders
 * the component when device dimensions change.
 *
 * @example
 * ```ts
 * const { window, breakpoint, orientation } = useRuntime()
 * ```
 */
export function useRuntime(): RuntimeValues {
  const [version, forceUpdate] = useReducer((n: number) => n + 1, 0)

  useEffect(() => {
    const listener = Dimensions.addEventListener("change", () => {
      forceUpdate()
    })

    return () => listener.remove()
  }, [])

  return useMemo(
    () => ({
      window: Runtime.window,
      screen: Runtime.screen,
      insets: Runtime.insets,
      statusBar: Runtime.statusBar,
      navigationBar: Runtime.navigationBar,
      orientation: Runtime.orientation,
      isPortrait: Runtime.isPortrait,
      isLandscape: Runtime.isLandscape,
      breakpoint: Runtime.breakpoint,
      breakpoints: Runtime.breakpoints,
      pixelRatio: Runtime.pixelRatio,
      fontScale: Runtime.fontScale,
      platform: Runtime.platform,
      colorScheme: Runtime.colorScheme,
      contentSizeCategory: Runtime.contentSizeCategory,
      isRTL: Runtime.isRTL,
      reduceMotion: Runtime.reduceMotion,
    }),
    [version]
  )
}
