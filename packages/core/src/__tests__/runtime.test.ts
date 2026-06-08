import { createElement, type ReactElement, type ReactNode } from "react"

import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { useStyles } from "../hooks"

import { ThemeProvider } from "../context"

import { StyleSheet } from "../stylesheet"

import { Runtime, resetRuntimeForTests, updateInsets, useRuntime } from "../runtime"

import { subscribe as subscribeBus } from "../reactivity"

import { resetStore, setStore } from "../store"

const reactNativeMock = vi.hoisted(() => {
  const testGlobal = globalThis as typeof globalThis & { __DEV__: boolean }
  testGlobal.__DEV__ = true

  const window = { width: 390, height: 844, scale: 3, fontScale: 1 }
  const screen = { width: 390, height: 844, scale: 3, fontScale: 1 }

  return {
    window,
    screen,
    dimensionsListeners: new Set<() => void>(),
    appearanceListeners: new Set<(state: { colorScheme: "light" | "dark" | null }) => void>(),
    reduceMotionListeners: new Set<(enabled: boolean) => void>()
  }
})

vi.mock("react-native", () => ({
  AccessibilityInfo: {
    addEventListener(_event: string, listener: (enabled: boolean) => void) {
      reactNativeMock.reduceMotionListeners.add(listener)

      return {
        remove() {
          reactNativeMock.reduceMotionListeners.delete(listener)
        }
      }
    },
    isReduceMotionEnabled() {
      return new Promise<boolean>(() => {})
    }
  },
  Appearance: {
    addChangeListener(listener: (state: { colorScheme: "light" | "dark" | null }) => void) {
      reactNativeMock.appearanceListeners.add(listener)

      return {
        remove() {
          reactNativeMock.appearanceListeners.delete(listener)
        }
      }
    },
    getColorScheme() {
      return "light"
    }
  },
  Dimensions: {
    addEventListener(_event: string, listener: () => void) {
      reactNativeMock.dimensionsListeners.add(listener)

      return {
        remove() {
          reactNativeMock.dimensionsListeners.delete(listener)
        }
      }
    },
    get(name: "window" | "screen") {
      return name === "window" ? reactNativeMock.window : reactNativeMock.screen
    }
  },
  I18nManager: {
    isRTL: false
  },
  PixelRatio: {
    get() {
      return 3
    },
    getFontScale() {
      return 1
    }
  },
  Platform: {
    OS: "ios"
  },
  StyleSheet: {
    absoluteFill: {},
    compose(first: unknown, second: unknown) {
      return second || first
    },
    create<T>(styles: T): T {
      return styles
    },
    flatten(style: unknown) {
      return style
    },
    hairlineWidth: 1
  }
}))

vi.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider({ children }: { children: ReactNode }) {
    return children
  },
  useSafeAreaInsets() {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }
}))

function renderUnderProvider(element: ReactElement): string {
  return renderToStaticMarkup(createElement(ThemeProvider, null, element))
}

beforeEach(() => {
  resetStore()
  resetRuntimeForTests()
  StyleSheet.configure({
    themes: {
      light: {}
    },
    settings: {
      initialTheme: "light"
    }
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  resetRuntimeForTests()
  resetStore()
})

describe("Runtime.insets warnings", () => {
  test("does not warn when useStyles reads insets on the first provider render", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const stylesheet = StyleSheet.create(({ runtime }) => ({
      content: { paddingBottom: runtime.insets.bottom }
    }))

    function StyledConsumer(): ReactElement {
      const styles = useStyles(stylesheet)

      return createElement("span", null, String(styles.content.paddingBottom))
    }

    expect(renderUnderProvider(createElement(StyledConsumer))).toContain(">0<")
    expect(warn).not.toHaveBeenCalled()
  })

  test("emits one warning when Runtime.insets is read before ThemeProvider mounts", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    expect(Runtime.insets).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
    expect(Runtime.insets).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("[dripstyle] Runtime.insets accessed before <ThemeProvider> mounted")
    )
  })
})

describe("granular runtime bus emits", () => {
  test("emits insets once when updateInsets changes safe-area values", () => {
    const listener = vi.fn()
    subscribeBus(["insets"], listener)

    updateInsets({ top: 1, right: 2, bottom: 3, left: 4 })
    updateInsets({ top: 1, right: 2, bottom: 3, left: 4 })

    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith("insets")
  })

  test("emits dimensions but not insets when Dimensions changes", () => {
    const dimensionsListener = vi.fn()
    const insetsListener = vi.fn()
    subscribeBus(["dimensions"], dimensionsListener)
    subscribeBus(["insets"], insetsListener)

    reactNativeMock.dimensionsListeners.forEach((trigger) => trigger())

    expect(dimensionsListener).toHaveBeenCalledWith("dimensions")
    expect(insetsListener).not.toHaveBeenCalled()
  })

  test("emits reduceMotion but not dimensions when reduce motion changes", () => {
    const reduceMotionListener = vi.fn()
    const dimensionsListener = vi.fn()
    subscribeBus(["reduceMotion"], reduceMotionListener)
    subscribeBus(["dimensions"], dimensionsListener)

    reactNativeMock.reduceMotionListeners.forEach((trigger) => trigger(true))

    expect(reduceMotionListener).toHaveBeenCalledWith("reduceMotion")
    expect(dimensionsListener).not.toHaveBeenCalled()
    expect(Runtime.reduceMotion).toBe(true)
  })

  test("emits colorScheme but not theme when Appearance changes", () => {
    const colorSchemeListener = vi.fn()
    const themeListener = vi.fn()
    subscribeBus(["colorScheme"], colorSchemeListener)
    subscribeBus(["theme"], themeListener)

    reactNativeMock.appearanceListeners.forEach((trigger) => trigger({ colorScheme: "dark" }))

    expect(colorSchemeListener).toHaveBeenCalledWith("colorScheme")
    expect(themeListener).not.toHaveBeenCalled()
  })

  test("useRuntime reads updated insets during render", () => {
    updateInsets({ top: 10, right: 0, bottom: 24, left: 0 })

    function RuntimeConsumer(): ReactElement {
      const runtime = useRuntime()

      return createElement("span", null, String(runtime.insets.bottom))
    }

    expect(renderUnderProvider(createElement(RuntimeConsumer))).toContain(">24<")
  })
})

describe("Runtime.breakpoint", () => {
  test("returns the smallest breakpoint when the window is below the next threshold", () => {
    reactNativeMock.window.width = 390
    setStore({ breakpoints: { xs: 0, sm: 640, md: 768 } })

    expect(Runtime.breakpoint).toBe("xs")
  })

  test("returns the largest breakpoint not exceeding the window width", () => {
    reactNativeMock.window.width = 800
    setStore({ breakpoints: { xs: 0, sm: 640, md: 768 } })

    expect(Runtime.breakpoint).toBe("md")
  })

  test("resolves correctly when breakpoints are registered out of order", () => {
    reactNativeMock.window.width = 700
    setStore({ breakpoints: { md: 768, xs: 0, sm: 640 } })

    expect(Runtime.breakpoint).toBe("sm")
  })
})
