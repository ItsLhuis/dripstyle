// @vitest-environment happy-dom

/// <reference lib="dom" />

import { act, createElement, type ReactElement, type ReactNode } from "react"

import { createRoot, type Root } from "react-dom/client"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { ScopedTheme } from "../ScopedTheme"
import { ThemeProvider } from "../context"
import { useStyles } from "../hooks"
import { Runtime, resetRuntimeForTests, updateInsets } from "../runtime"
import { resetStore } from "../store"
import { StyleSheet } from "../stylesheet"
import { createVariant } from "../variants"

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const reactNativeMock = vi.hoisted(() => {
  const testGlobal = globalThis as typeof globalThis & { __DEV__: boolean }
  testGlobal.__DEV__ = true

  return {
    window: { width: 390, height: 844, scale: 3, fontScale: 1 },
    screen: { width: 390, height: 844, scale: 3, fontScale: 1 },
    colorScheme: "light" as "light" | "dark",
    dimensionsListeners: new Set<() => void>(),
    appearanceListeners: new Set<(state: { colorScheme: "light" | "dark" }) => void>(),
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
    addChangeListener(listener: (state: { colorScheme: "light" | "dark" }) => void) {
      reactNativeMock.appearanceListeners.add(listener)

      return {
        remove() {
          reactNativeMock.appearanceListeners.delete(listener)
        }
      }
    },
    getColorScheme() {
      return reactNativeMock.colorScheme
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
  I18nManager: { isRTL: false },
  PixelRatio: {
    get() {
      return 3
    },
    getFontScale() {
      return 1
    }
  },
  Platform: { OS: "ios" },
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

const lightTheme = { colors: { background: "#ffffff", primary: "#111111" } }
const darkTheme = { colors: { background: "#000000", primary: "#eeeeee" } }

type TestTheme = { colors: { background: string; primary: string } }

const activeRoots = new Set<Root>()

function render(element: ReactElement): HTMLElement {
  const container = document.createElement("div")
  const root = createRoot(container)

  act(() => {
    root.render(element)
  })

  activeRoots.add(root)

  return container
}

function setActiveTheme(name: "light" | "dark"): void {
  act(() => {
    Runtime.setTheme(name)
  })
}

function triggerDimensionsChange(width: number): void {
  act(() => {
    reactNativeMock.window.width = width
    reactNativeMock.dimensionsListeners.forEach((listener) => listener())
  })
}

function triggerInsetsChange(bottom: number): void {
  act(() => {
    updateInsets({ top: 0, right: 0, bottom, left: 0 })
  })
}

function triggerColorSchemeChange(scheme: "light" | "dark"): void {
  act(() => {
    reactNativeMock.colorScheme = scheme
    reactNativeMock.appearanceListeners.forEach((listener) => listener({ colorScheme: scheme }))
  })
}

beforeEach(() => {
  resetStore()
  resetRuntimeForTests()
  reactNativeMock.window.width = 390
  reactNativeMock.colorScheme = "light"
  StyleSheet.configure({
    themes: { light: lightTheme, dark: darkTheme },
    settings: { initialTheme: "light" }
  })
})

afterEach(() => {
  activeRoots.forEach((root) => {
    act(() => {
      root.unmount()
    })
  })
  activeRoots.clear()

  vi.restoreAllMocks()
  resetRuntimeForTests()
  resetStore()
})

type RenderCounter = { count: number }

function createCounter(): RenderCounter {
  return { count: 0 }
}

describe("static stylesheet re-rendering", () => {
  const staticSheet = StyleSheet.create({ box: { flex: 1 } })

  test("does not re-render when dimensions, insets, color scheme, or theme change", () => {
    const counter = createCounter()

    function StaticConsumer(): ReactElement {
      const styles = useStyles(staticSheet)

      counter.count += 1

      return createElement("span", null, String(styles.box.flex))
    }

    render(createElement(ThemeProvider, null, createElement(StaticConsumer)))

    expect(counter.count).toBe(1)

    triggerDimensionsChange(800)
    triggerInsetsChange(24)
    triggerColorSchemeChange("dark")
    setActiveTheme("dark")

    expect(counter.count).toBe(1)
  })
})

describe("theme-only factory re-rendering", () => {
  const themeSheet = StyleSheet.create(({ theme }) => ({
    box: { backgroundColor: (theme as TestTheme).colors.background }
  }))

  test("re-renders on a theme change but not on a dimensions change", () => {
    const counter = createCounter()

    function ThemeConsumer(): ReactElement {
      const styles = useStyles(themeSheet)

      counter.count += 1

      return createElement("span", null, String(styles.box.backgroundColor))
    }

    render(createElement(ThemeProvider, null, createElement(ThemeConsumer)))

    expect(counter.count).toBe(1)

    triggerDimensionsChange(800)

    expect(counter.count).toBe(1)

    setActiveTheme("dark")

    expect(counter.count).toBe(2)
  })

  test("updates the produced style value when the theme changes", () => {
    function ThemeConsumer(): ReactElement {
      const styles = useStyles(themeSheet)

      return createElement("span", null, String(styles.box.backgroundColor))
    }

    const container = render(createElement(ThemeProvider, null, createElement(ThemeConsumer)))

    expect(container.textContent).toBe(lightTheme.colors.background)

    setActiveTheme("dark")

    expect(container.textContent).toBe(darkTheme.colors.background)
  })
})

describe("insets-only factory re-rendering", () => {
  const insetsSheet = StyleSheet.create(({ runtime }) => ({
    box: { paddingBottom: runtime.insets.bottom }
  }))

  test("re-renders on an inset change but not on a theme or color-scheme change", () => {
    const counter = createCounter()

    function InsetsConsumer(): ReactElement {
      const styles = useStyles(insetsSheet)

      counter.count += 1

      return createElement("span", null, String(styles.box.paddingBottom))
    }

    render(createElement(ThemeProvider, null, createElement(InsetsConsumer)))

    expect(counter.count).toBe(1)

    setActiveTheme("dark")
    triggerColorSchemeChange("dark")

    expect(counter.count).toBe(1)

    triggerInsetsChange(24)

    expect(counter.count).toBe(2)
  })
})

describe("inline-function dependency capture", () => {
  const inlineSheet = StyleSheet.create(({ theme }) => ({
    row: { flexDirection: "row" as const },
    card: (selected: boolean) => ({
      borderColor: selected ? (theme as TestTheme).colors.primary : "transparent"
    })
  }))

  test("re-renders on a theme change when only the inline function reads theme", () => {
    const counter = createCounter()

    function InlineConsumer(): ReactElement {
      const styles = useStyles(inlineSheet)

      counter.count += 1

      return createElement("span", null, String(styles.card(true).borderColor))
    }

    render(createElement(ThemeProvider, null, createElement(InlineConsumer)))

    expect(counter.count).toBe(1)

    triggerDimensionsChange(800)

    expect(counter.count).toBe(1)

    setActiveTheme("dark")

    expect(counter.count).toBe(2)
  })
})

describe("variant config dependency capture", () => {
  const variantSheet = StyleSheet.create(({ theme }) => ({
    button: createVariant({
      base: { backgroundColor: (theme as TestTheme).colors.primary },
      variants: { size: { sm: { padding: 8 }, md: { padding: 12 } } }
    })
  }))

  test("re-renders on a theme change when a createVariant config reads theme", () => {
    const counter = createCounter()

    function VariantConsumer(): ReactElement {
      const styles = useStyles(variantSheet)

      counter.count += 1

      return createElement("span", null, String(styles.button({ size: "sm" }).padding))
    }

    render(createElement(ThemeProvider, null, createElement(VariantConsumer)))

    expect(counter.count).toBe(1)

    setActiveTheme("dark")

    expect(counter.count).toBe(2)
  })
})

describe("adaptive color-scheme theme switching", () => {
  const adaptiveSheet = StyleSheet.create(({ theme }) => ({
    box: { backgroundColor: (theme as TestTheme).colors.background }
  }))

  test("switches theme and re-renders theme-dependent consumers when the scheme changes", () => {
    resetStore()
    StyleSheet.configure({
      themes: { light: lightTheme, dark: darkTheme },
      settings: { adaptiveThemes: true }
    })

    const counter = createCounter()

    function ThemeConsumer(): ReactElement {
      const styles = useStyles(adaptiveSheet)

      counter.count += 1

      return createElement("span", null, String(styles.box.backgroundColor))
    }

    const container = render(createElement(ThemeProvider, null, createElement(ThemeConsumer)))

    expect(container.textContent).toBe(lightTheme.colors.background)

    triggerColorSchemeChange("dark")

    expect(container.textContent).toBe(darkTheme.colors.background)
    expect(counter.count).toBeGreaterThan(1)
  })
})

describe("ScopedTheme", () => {
  const themeSheet = StyleSheet.create(({ theme }) => ({
    box: { backgroundColor: (theme as TestTheme).colors.background }
  }))

  test("produces styles from the scoped theme rather than the active theme", () => {
    function ScopedConsumer(): ReactElement {
      const styles = useStyles(themeSheet)

      return createElement("span", null, String(styles.box.backgroundColor))
    }

    const container = render(
      createElement(
        ThemeProvider,
        null,
        createElement(ScopedTheme, { theme: "dark", children: createElement(ScopedConsumer) })
      )
    )

    expect(container.textContent).toBe(darkTheme.colors.background)
  })
})

describe("provider guard", () => {
  test("throws when useStyles is called outside ThemeProvider", () => {
    const sheet = StyleSheet.create({ box: { flex: 1 } })

    function BareConsumer(): ReactElement {
      const styles = useStyles(sheet)

      return createElement("span", null, String(styles.box.flex))
    }

    expect(() => renderToStaticMarkup(createElement(BareConsumer))).toThrow(
      "[dripstyle] useStyles() must be called inside <ThemeProvider>"
    )
  })
})
