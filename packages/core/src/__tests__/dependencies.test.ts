import { describe, expect, test, vi } from "vitest"

import { createTrackingContext } from "../dependencies"

import type { RuntimeValues, Theme } from "../types"

const colors = { primary: "#fff", background: "#000" }

function makeTheme(): Theme {
  return { colors } as unknown as Theme
}

function makeRuntime(overrides: Partial<RuntimeValues> = {}): RuntimeValues {
  return {
    window: { width: 390, height: 844, scale: 3, fontScale: 1 },
    screen: { width: 390, height: 844, scale: 3, fontScale: 1 },
    insets: { top: 10, right: 0, bottom: 24, left: 0 },
    statusBar: { height: 10 },
    navigationBar: { height: 24 },
    orientation: "portrait",
    isPortrait: true,
    isLandscape: false,
    breakpoint: "md",
    breakpoints: { md: 768 },
    pixelRatio: 3,
    fontScale: 1,
    platform: "ios",
    colorScheme: "light",
    contentSizeCategory: null,
    isRTL: false,
    reduceMotion: false,
    ...overrides
  } as RuntimeValues
}

describe("createTrackingContext theme proxy", () => {
  test("records theme when any theme property is read", () => {
    const record = vi.fn()
    const { theme } = createTrackingContext(record, { theme: makeTheme(), runtime: makeRuntime() })

    void (theme as { colors: typeof colors }).colors

    expect(record).toHaveBeenCalledWith("theme")
  })

  test("returns the real nested value without wrapping it in a proxy", () => {
    const record = vi.fn()
    const { theme } = createTrackingContext(record, { theme: makeTheme(), runtime: makeRuntime() })

    const result = (theme as { colors: typeof colors }).colors

    expect(result).toBe(colors)
  })
})

describe("createTrackingContext runtime proxy", () => {
  test("records dimensions when a window field is read", () => {
    const record = vi.fn()
    const { runtime } = createTrackingContext(record, {
      theme: makeTheme(),
      runtime: makeRuntime()
    })

    void runtime.window

    expect(record).toHaveBeenCalledWith("dimensions")
  })

  test("records insets and returns the real insets object when insets is read", () => {
    const record = vi.fn()
    const realRuntime = makeRuntime()
    const { runtime } = createTrackingContext(record, { theme: makeTheme(), runtime: realRuntime })

    const result = runtime.insets

    expect(record).toHaveBeenCalledWith("insets")
    expect(result).toBe(realRuntime.insets)
  })

  test("records colorScheme when colorScheme is read", () => {
    const record = vi.fn()
    const { runtime } = createTrackingContext(record, {
      theme: makeTheme(),
      runtime: makeRuntime()
    })

    void runtime.colorScheme

    expect(record).toHaveBeenCalledWith("colorScheme")
  })

  test("records reduceMotion when reduceMotion is read", () => {
    const record = vi.fn()
    const { runtime } = createTrackingContext(record, {
      theme: makeTheme(),
      runtime: makeRuntime()
    })

    void runtime.reduceMotion

    expect(record).toHaveBeenCalledWith("reduceMotion")
  })

  test("records no key when a process-constant field is read", () => {
    const record = vi.fn()
    const { runtime } = createTrackingContext(record, {
      theme: makeTheme(),
      runtime: makeRuntime()
    })

    void runtime.platform
    void runtime.isRTL
    void runtime.contentSizeCategory

    expect(record).not.toHaveBeenCalled()
  })

  test("returns the real runtime value for a non-reactive field", () => {
    const record = vi.fn()
    const { runtime } = createTrackingContext(record, {
      theme: makeTheme(),
      runtime: makeRuntime()
    })

    expect(runtime.platform).toBe("ios")
  })
})
