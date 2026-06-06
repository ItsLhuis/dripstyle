import { useEffect, useMemo, useReducer } from "react"

import {
  AccessibilityInfo,
  Appearance,
  Dimensions,
  I18nManager,
  PixelRatio,
  Platform
} from "react-native"

import { getStore, setStore, warnIfInsetsAccessedBeforeMount } from "./store"

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

type Insets = { top: number; right: number; bottom: number; left: number }

let _insets: Insets = { top: 0, right: 0, bottom: 0, left: 0 }
let _reduceMotion = false

const runtimeListeners = new Set<() => void>()

function notifyRuntime(): void {
  runtimeListeners.forEach((listener) => {
    listener()
  })
}

/**
 * Subscribes to runtime environment changes (dimensions, safe area insets, reduce motion,
 * color scheme). Internal; consumed by {@link useRuntime}.
 *
 * @returns An unsubscribe function.
 */
export function subscribeRuntime(listener: () => void): () => void {
  runtimeListeners.add(listener)

  return () => {
    runtimeListeners.delete(listener)
  }
}

/**
 * Updates safe area insets and notifies subscribers so `useRuntime()` consumers re-render.
 *
 * Called by `ThemeProvider` when `SafeAreaProvider` reports values. No-ops when the values are
 * unchanged, so repeated reports never trigger redundant renders.
 */
export function updateInsets(insets: Insets): void {
  if (
    insets.top === _insets.top &&
    insets.right === _insets.right &&
    insets.bottom === _insets.bottom &&
    insets.left === _insets.left
  ) {
    return
  }

  _insets = insets

  notifyRuntime()
}

/**
 * Resets runtime-only state. For use in tests only.
 */
export function resetRuntimeForTests(): void {
  _insets = { top: 0, right: 0, bottom: 0, left: 0 }
  _reduceMotion = false
  runtimeListeners.clear()
}

AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
  _reduceMotion = enabled
  notifyRuntime()
})

AccessibilityInfo.addEventListener("reduceMotionChanged", (enabled: boolean) => {
  _reduceMotion = enabled
  notifyRuntime()
})

Dimensions.addEventListener("change", () => {
  notifyRuntime()
})

Appearance.addChangeListener(() => {
  notifyRuntime()
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
    warnIfInsetsAccessedBeforeMount()

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
          [name]: updater(current)
        }
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
  }
} as const

/**
 * Reactive hook that returns current runtime values and re-renders the component when runtime
 * environment values change.
 *
 * @example
 * ```ts
 * const { window, breakpoint, orientation } = useRuntime()
 * ```
 */
export function useRuntime(): RuntimeValues {
  const [version, forceUpdate] = useReducer((current: number) => current + 1, 0)

  useEffect(() => {
    const unsubscribe = subscribeRuntime(() => {
      forceUpdate()
    })

    return unsubscribe
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
      reduceMotion: Runtime.reduceMotion
    }),
    [version]
  )
}
