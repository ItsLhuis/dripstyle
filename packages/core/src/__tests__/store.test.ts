import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import { clearAllListeners, subscribe as subscribeBus } from "../reactivity"

import {
  assertNotConfiguredAfterMount,
  getStore,
  markProviderMounted,
  markProviderUnmounted,
  notifyListeners,
  resetStore,
  setStore,
  subscribe,
  warnIfInsetsAccessedBeforeMount,
  warnIfNotConfigured
} from "../store"

const testGlobal = globalThis as typeof globalThis & { __DEV__: boolean }
testGlobal.__DEV__ = true

beforeEach(() => {
  resetStore()
})

afterEach(() => {
  vi.restoreAllMocks()
  clearAllListeners()
})

describe("getStore", () => {
  test("returns initial state after reset", () => {
    const state = getStore()

    expect(state.registeredThemes).toEqual({})
    expect(state.breakpoints).toEqual({})
    expect(state.activeThemeName).toBeNull()
    expect(state.adaptiveThemes).toBe(false)
    expect(state.isConfigured).toBe(false)
    expect(state.isProviderMounted).toBe(false)
    expect(state.hasWarnedInsetsAccess).toBe(false)
  })
})

describe("setStore", () => {
  test("merges partial state into the store", () => {
    setStore({ isConfigured: true, activeThemeName: "light" })

    const state = getStore()
    expect(state.isConfigured).toBe(true)
    expect(state.activeThemeName).toBe("light")
  })

  test("does not overwrite fields not included in the partial update", () => {
    setStore({ isConfigured: true })

    expect(getStore().adaptiveThemes).toBe(false)
    expect(getStore().activeThemeName).toBeNull()
  })

  test("stores registered themes and breakpoints", () => {
    setStore({
      registeredThemes: { light: { colors: { background: "#fff" } } },
      breakpoints: { xs: 0, md: 768 }
    })

    const state = getStore()
    expect(state.registeredThemes).toEqual({ light: { colors: { background: "#fff" } } })
    expect(state.breakpoints).toEqual({ xs: 0, md: 768 })
  })
})

describe("subscribe", () => {
  test("calls listener when notifyListeners is called", () => {
    const listener = vi.fn()
    subscribe(listener)

    notifyListeners()

    expect(listener).toHaveBeenCalledOnce()
  })

  test("calls listener when setStore triggers a change", () => {
    const listener = vi.fn()
    subscribe(listener)

    setStore({ isConfigured: true })

    expect(listener).toHaveBeenCalledOnce()
  })

  test("stops calling listener after unsubscribe", () => {
    const listener = vi.fn()
    const unsubscribe = subscribe(listener)

    unsubscribe()
    notifyListeners()

    expect(listener).not.toHaveBeenCalled()
  })

  test("notifies all active listeners", () => {
    const first = vi.fn()
    const second = vi.fn()

    subscribe(first)
    subscribe(second)
    notifyListeners()

    expect(first).toHaveBeenCalledOnce()
    expect(second).toHaveBeenCalledOnce()
  })

  test("only removes the unsubscribed listener, not others", () => {
    const first = vi.fn()
    const second = vi.fn()

    const unsubscribe = subscribe(first)
    subscribe(second)

    unsubscribe()
    notifyListeners()

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledOnce()
  })
})

describe("setStore theme bus emits", () => {
  test("emits theme when the active theme name changes", () => {
    const listener = vi.fn()
    subscribeBus(["theme"], listener)

    setStore({ activeThemeName: "dark" })

    expect(listener).toHaveBeenCalledWith("theme")
  })

  test("emits theme when registered themes change", () => {
    const listener = vi.fn()
    subscribeBus(["theme"], listener)

    setStore({ registeredThemes: { light: {} } })

    expect(listener).toHaveBeenCalledWith("theme")
  })

  test("emits theme when the adaptive flag changes", () => {
    const listener = vi.fn()
    subscribeBus(["theme"], listener)

    setStore({ adaptiveThemes: true })

    expect(listener).toHaveBeenCalledWith("theme")
  })

  test("does not emit theme when only non-theme fields change", () => {
    const listener = vi.fn()
    subscribeBus(["theme"], listener)

    setStore({ isConfigured: true })

    expect(listener).not.toHaveBeenCalled()
  })
})

describe("setStore breakpoint ordering", () => {
  test("precomputes ascending sorted breakpoint names when breakpoints change", () => {
    setStore({ breakpoints: { md: 768, xs: 0, sm: 640 } })

    expect(getStore().sortedBreakpoints).toEqual(["xs", "sm", "md"])
  })

  test("resets sorted breakpoints to empty on resetStore", () => {
    setStore({ breakpoints: { xs: 0, md: 768 } })

    resetStore()

    expect(getStore().sortedBreakpoints).toEqual([])
  })
})

describe("provider mount markers", () => {
  test("markProviderMounted sets mounted without notifying listeners", () => {
    const listener = vi.fn()
    subscribe(listener)

    markProviderMounted()

    expect(getStore().isProviderMounted).toBe(true)
    expect(listener).not.toHaveBeenCalled()
  })

  test("markProviderUnmounted clears mounted without notifying listeners", () => {
    markProviderMounted()
    const listener = vi.fn()
    subscribe(listener)

    markProviderUnmounted()

    expect(getStore().isProviderMounted).toBe(false)
    expect(listener).not.toHaveBeenCalled()
  })
})

describe("notifyListeners", () => {
  test("calls each registered listener once per invocation", () => {
    const listener = vi.fn()
    subscribe(listener)

    notifyListeners()
    notifyListeners()

    expect(listener).toHaveBeenCalledTimes(2)
  })

  test("does nothing when no listeners are registered", () => {
    expect(() => notifyListeners()).not.toThrow()
  })
})

describe("resetStore", () => {
  test("resets all state fields back to initial values", () => {
    setStore({
      registeredThemes: { light: {} },
      breakpoints: { xs: 0 },
      activeThemeName: "light",
      adaptiveThemes: true,
      isConfigured: true,
      isProviderMounted: true
    })

    resetStore()

    const state = getStore()
    expect(state.registeredThemes).toEqual({})
    expect(state.breakpoints).toEqual({})
    expect(state.activeThemeName).toBeNull()
    expect(state.adaptiveThemes).toBe(false)
    expect(state.isConfigured).toBe(false)
    expect(state.isProviderMounted).toBe(false)
    expect(state.hasWarnedInsetsAccess).toBe(false)
  })

  test("removes all listeners after reset", () => {
    const listener = vi.fn()
    subscribe(listener)

    resetStore()
    notifyListeners()

    expect(listener).not.toHaveBeenCalled()
  })
})

describe("assertNotConfiguredAfterMount", () => {
  test("throws when ThemeProvider is already mounted", () => {
    setStore({ isProviderMounted: true })

    expect(() => assertNotConfiguredAfterMount("StyleSheet.configure()")).toThrow(
      "[dripstyle] StyleSheet.configure() must be called before <ThemeProvider> mounts."
    )
  })

  test("does not throw when ThemeProvider is not yet mounted", () => {
    expect(() => assertNotConfiguredAfterMount("StyleSheet.configure()")).not.toThrow()
  })
})

describe("warnIfNotConfigured", () => {
  test("emits console.warn when configure has not been called", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    warnIfNotConfigured("StyleSheet.create()")

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "[dripstyle] StyleSheet.create() called before StyleSheet.configure()"
      )
    )
  })

  test("does not emit console.warn when configure has been called", () => {
    setStore({ isConfigured: true })
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    warnIfNotConfigured("StyleSheet.create()")

    expect(warn).not.toHaveBeenCalled()
  })
})

describe("warnIfInsetsAccessedBeforeMount", () => {
  test("emits console.warn once before ThemeProvider mounts", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})

    warnIfInsetsAccessedBeforeMount()
    warnIfInsetsAccessedBeforeMount()

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("[dripstyle] Runtime.insets accessed before <ThemeProvider> mounted")
    )
    expect(getStore().hasWarnedInsetsAccess).toBe(true)
  })

  test("does not emit console.warn when ThemeProvider is mounted", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    markProviderMounted()

    warnIfInsetsAccessedBeforeMount()

    expect(warn).not.toHaveBeenCalled()
    expect(getStore().hasWarnedInsetsAccess).toBe(false)
  })

  test("resetStore clears the warning gate", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {})

    warnIfInsetsAccessedBeforeMount()
    resetStore()

    expect(getStore().hasWarnedInsetsAccess).toBe(false)
  })
})
