import { describe, expect, test } from "vitest"

import {
  alpha,
  contrastColor,
  darken,
  isLight,
  lighten,
  mix,
  parseColor,
  toHex,
  withOpacity
} from "../colors"

describe("withOpacity", () => {
  test("adds alpha channel to rgb string", () => {
    expect(withOpacity("rgb(255, 0, 0)", 0.5)).toBe("rgba(255, 0, 0, 0.5)")
  })

  test("replaces existing alpha in rgba string", () => {
    expect(withOpacity("rgba(255, 0, 0, 1)", 0.3)).toBe("rgba(255, 0, 0, 0.3)")
  })

  test("returns color unchanged when format is not rgb or rgba", () => {
    expect(withOpacity("#ff0000", 0.5)).toBe("#ff0000")
    expect(withOpacity("hsl(0, 100%, 50%)", 0.5)).toBe("hsl(0, 100%, 50%)")
  })

  test("clamps opacity below 0 to 0", () => {
    expect(withOpacity("rgb(255, 0, 0)", -0.5)).toBe("rgba(255, 0, 0, 0)")
  })

  test("clamps opacity above 1 to 1", () => {
    expect(withOpacity("rgb(255, 0, 0)", 1.5)).toBe("rgba(255, 0, 0, 1)")
  })

  test("preserves zero opacity", () => {
    expect(withOpacity("rgb(0, 0, 0)", 0)).toBe("rgba(0, 0, 0, 0)")
  })
})

describe("alpha", () => {
  test("produces same result as withOpacity", () => {
    expect(alpha("rgb(0, 128, 255)", 0.7)).toBe(withOpacity("rgb(0, 128, 255)", 0.7))
  })
})

describe("lighten", () => {
  test("returns a lighter color when given a valid rgb input", () => {
    const result = lighten("rgb(100, 100, 100)", 0.2)
    const parsed = parseColor(result)

    expect(parsed.r).toBeGreaterThan(100)
    expect(parsed.g).toBeGreaterThan(100)
    expect(parsed.b).toBeGreaterThan(100)
  })

  test("returns the original string when input is invalid", () => {
    expect(lighten("not-a-color", 0.2)).toBe("not-a-color")
  })

  test("does not exceed channel maximum when amount is 1", () => {
    const result = lighten("rgb(200, 200, 200)", 1)
    const parsed = parseColor(result)

    expect(parsed.r).toBeLessThanOrEqual(255)
    expect(parsed.g).toBeLessThanOrEqual(255)
    expect(parsed.b).toBeLessThanOrEqual(255)
  })

  test("returns an rgb-formatted string", () => {
    const result = lighten("rgb(100, 100, 100)", 0.1)

    expect(result).toMatch(/^rgb/)
  })
})

describe("darken", () => {
  test("returns a darker color when given a valid rgb input", () => {
    const result = darken("rgb(200, 200, 200)", 0.2)
    const parsed = parseColor(result)

    expect(parsed.r).toBeLessThan(200)
    expect(parsed.g).toBeLessThan(200)
    expect(parsed.b).toBeLessThan(200)
  })

  test("returns the original string when input is invalid", () => {
    expect(darken("not-a-color", 0.2)).toBe("not-a-color")
  })

  test("does not go below channel minimum when amount is 1", () => {
    const result = darken("rgb(50, 50, 50)", 1)
    const parsed = parseColor(result)

    expect(parsed.r).toBeGreaterThanOrEqual(0)
    expect(parsed.g).toBeGreaterThanOrEqual(0)
    expect(parsed.b).toBeGreaterThanOrEqual(0)
  })

  test("returns an rgb-formatted string", () => {
    const result = darken("rgb(200, 200, 200)", 0.1)

    expect(result).toMatch(/^rgb/)
  })
})

describe("mix", () => {
  test("blends two colors at midpoint by default", () => {
    const result = mix("rgb(255, 0, 0)", "rgb(0, 0, 255)")
    const parsed = parseColor(result)

    expect(parsed.r).toBeGreaterThan(0)
    expect(parsed.b).toBeGreaterThan(0)
  })

  test("returns color1 when weight is 1", () => {
    const result = mix("rgb(255, 0, 0)", "rgb(0, 0, 255)", 1)
    const parsed = parseColor(result)

    expect(parsed.r).toBeGreaterThan(parsed.b)
  })

  test("returns color2 when weight is 0", () => {
    const result = mix("rgb(255, 0, 0)", "rgb(0, 0, 255)", 0)
    const parsed = parseColor(result)

    expect(parsed.b).toBeGreaterThan(parsed.r)
  })

  test("clamps weight above 1", () => {
    const clamped = mix("rgb(255, 0, 0)", "rgb(0, 0, 255)", 1.5)
    const exact = mix("rgb(255, 0, 0)", "rgb(0, 0, 255)", 1)

    expect(clamped).toBe(exact)
  })

  test("returns color1 when color2 is invalid", () => {
    expect(mix("rgb(255, 0, 0)", "not-a-color")).toBe("rgb(255, 0, 0)")
  })
})

describe("contrastColor", () => {
  test("returns black for white background", () => {
    expect(contrastColor("rgb(255, 255, 255)")).toBe("#000000")
  })

  test("returns white for black background", () => {
    expect(contrastColor("rgb(0, 0, 0)")).toBe("#ffffff")
  })

  test("returns black for light yellow background", () => {
    expect(contrastColor("rgb(255, 255, 0)")).toBe("#000000")
  })

  test("returns white for dark blue background", () => {
    expect(contrastColor("rgb(0, 0, 128)")).toBe("#ffffff")
  })

  test("returns black as fallback when input is invalid", () => {
    expect(contrastColor("not-a-color")).toBe("#000000")
  })
})

describe("isLight", () => {
  test("returns true for white", () => {
    expect(isLight("rgb(255, 255, 255)")).toBe(true)
  })

  test("returns false for black", () => {
    expect(isLight("rgb(0, 0, 0)")).toBe(false)
  })

  test("returns true for light yellow", () => {
    expect(isLight("rgb(255, 255, 0)")).toBe(true)
  })

  test("returns false for dark blue", () => {
    expect(isLight("rgb(0, 0, 128)")).toBe(false)
  })
})

describe("toHex", () => {
  test("converts rgb string to hex", () => {
    expect(toHex("rgb(255, 0, 0)")).toBe("#ff0000")
  })

  test("normalizes hex input to lowercase hex", () => {
    expect(toHex("#FF0000")).toBe("#ff0000")
  })

  test("converts named color to hex", () => {
    expect(toHex("red")).toBe("#ff0000")
  })

  test("returns original string when input is invalid", () => {
    expect(toHex("not-a-color")).toBe("not-a-color")
  })
})

describe("parseColor", () => {
  test("parses rgb string into rgba components", () => {
    expect(parseColor("rgb(255, 0, 0)")).toEqual({ r: 255, g: 0, b: 0, a: 1 })
  })

  test("parses hex string into rgba components", () => {
    expect(parseColor("#ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 })
  })

  test("parses rgba string with alpha channel", () => {
    const result = parseColor("rgba(0, 128, 255, 0.5)")

    expect(result.r).toBe(0)
    expect(result.g).toBe(128)
    expect(result.b).toBe(255)
    expect(result.a).toBeCloseTo(0.5)
  })

  test("returns zero-value fallback when input is invalid", () => {
    expect(parseColor("not-a-color")).toEqual({ r: 0, g: 0, b: 0, a: 1 })
  })

  test("rounds channel values to integers", () => {
    const result = parseColor("rgb(255, 255, 255)")

    expect(Number.isInteger(result.r)).toBe(true)
    expect(Number.isInteger(result.g)).toBe(true)
    expect(Number.isInteger(result.b)).toBe(true)
  })
})
