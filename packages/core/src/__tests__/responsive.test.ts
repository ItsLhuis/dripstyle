import { afterEach, beforeEach, describe, expect, test } from "vitest"

import { responsive } from "../responsive"
import { resetStore, setStore } from "../store"

const breakpoints = { xs: 0, sm: 640, md: 768, lg: 1024 }

beforeEach(() => {
  setStore({ breakpoints })
})

afterEach(() => {
  resetStore()
})

describe("responsive", () => {
  test("returns value defined at the exact active breakpoint", () => {
    expect(responsive({ xs: 16 }, "xs")).toBe(16)
  })

  test("cascades to nearest smaller breakpoint when current has no entry", () => {
    expect(responsive({ xs: 16 }, "sm")).toBe(16)
  })

  test("returns value from current breakpoint when explicitly defined", () => {
    expect(responsive({ xs: 16, md: 24 }, "md")).toBe(24)
  })

  test("cascades across multiple breakpoints to find nearest defined value", () => {
    expect(responsive({ xs: 16, md: 24 }, "lg")).toBe(24)
  })

  test("does not cascade forward to larger breakpoints", () => {
    expect(responsive({ xs: 16, md: 24 }, "sm")).toBe(16)
  })

  test("returns undefined when no value is defined at or below current breakpoint", () => {
    expect(responsive({}, "md")).toBeUndefined()
  })

  test("returns undefined when breakpoint is not registered in store", () => {
    expect(responsive({ xs: 16 }, "xxl" as string)).toBeUndefined()
  })

  test("resolves string values", () => {
    expect(responsive({ xs: "flex-start", md: "center" }, "md")).toBe("center")
  })

  test("resolves object values", () => {
    const xs = { padding: 8 }
    const md = { padding: 16 }

    expect(responsive({ xs, md }, "md")).toBe(md)
  })

  test("resolves correctly when breakpoints are registered in non-ascending order", () => {
    resetStore()
    setStore({ breakpoints: { lg: 1024, xs: 0, md: 768 } })

    expect(responsive({ xs: 16, md: 24 }, "md")).toBe(24)
  })

  test("returns last defined value when multiple breakpoints match in cascade", () => {
    expect(responsive({ xs: 8, sm: 12, md: 16 }, "lg")).toBe(16)
  })
})
