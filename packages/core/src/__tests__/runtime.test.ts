import { createElement, type ReactElement, type ReactNode } from "react"

import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { useStyles } from "../hooks"

import { ThemeProvider } from "../context"

import { StyleSheet } from "../stylesheet"

import {
  Runtime,
  resetRuntimeForTests,
  subscribeRuntime,
  updateInsets,
  useRuntime
} from "../runtime"

import { resetStore } from "../store"

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

describe("runtime insets reactivity", () => {
  test("notifies runtime subscribers when updateInsets changes safe-area values", () => {
    const listener = vi.fn()
    const unsubscribe = subscribeRuntime(listener)

    updateInsets({ top: 1, right: 2, bottom: 3, left: 4 })
    updateInsets({ top: 1, right: 2, bottom: 3, left: 4 })

    expect(listener).toHaveBeenCalledOnce()

    unsubscribe()
    updateInsets({ top: 5, right: 6, bottom: 7, left: 8 })

    expect(listener).toHaveBeenCalledOnce()
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
