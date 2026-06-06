import { describe, expect, test } from "vitest"

import { VARIANT_MARKER } from "../types"
import { createVariant } from "../variants"

describe("createVariant", () => {
  test("applies base style when no props are passed", () => {
    const variant = createVariant({
      base: { borderRadius: 8 },
      variants: {}
    })

    expect(variant()).toEqual({ borderRadius: 8 })
  })

  test("applies matching variant style", () => {
    const variant = createVariant({
      variants: {
        size: {
          sm: { padding: 8 },
          md: { padding: 12 }
        }
      }
    })

    expect(variant({ size: "sm" })).toEqual({ padding: 8 })
    expect(variant({ size: "md" })).toEqual({ padding: 12 })
  })

  test("merges base style with variant style", () => {
    const variant = createVariant({
      base: { borderRadius: 8 },
      variants: {
        size: { sm: { padding: 8 } }
      }
    })

    expect(variant({ size: "sm" })).toEqual({ borderRadius: 8, padding: 8 })
  })

  test("later variant overrides base when keys conflict", () => {
    const variant = createVariant({
      base: { padding: 4 },
      variants: {
        size: { lg: { padding: 16 } }
      }
    })

    expect(variant({ size: "lg" })).toEqual({ padding: 16 })
  })

  test("uses defaultVariants when prop is omitted", () => {
    const variant = createVariant({
      variants: {
        size: {
          sm: { padding: 8 },
          md: { padding: 12 }
        }
      },
      defaultVariants: { size: "md" }
    })

    expect(variant()).toEqual({ padding: 12 })
  })

  test("overrides defaultVariant when explicit prop is provided", () => {
    const variant = createVariant({
      variants: {
        size: {
          sm: { padding: 8 },
          md: { padding: 12 }
        }
      },
      defaultVariants: { size: "md" }
    })

    expect(variant({ size: "sm" })).toEqual({ padding: 8 })
  })

  test("merges multiple independent variant dimensions", () => {
    const variant = createVariant({
      variants: {
        size: { sm: { padding: 8 } },
        intent: { primary: { backgroundColor: "blue" } }
      }
    })

    expect(variant({ size: "sm", intent: "primary" })).toEqual({
      padding: 8,
      backgroundColor: "blue"
    })
  })

  test("applies compound variant when all conditions match", () => {
    const variant = createVariant({
      variants: {
        size: { sm: { padding: 8 }, lg: { padding: 16 } },
        intent: { primary: { backgroundColor: "blue" }, ghost: { backgroundColor: "transparent" } }
      },
      compoundVariants: [{ size: "sm", intent: "primary", style: { borderWidth: 2 } }]
    })

    const result = variant({ size: "sm", intent: "primary" })

    expect(result).toMatchObject({ borderWidth: 2 })
  })

  test("does not apply compound variant when one condition fails", () => {
    const variant = createVariant({
      variants: {
        size: { sm: { padding: 8 }, lg: { padding: 16 } },
        intent: { primary: { backgroundColor: "blue" }, ghost: { backgroundColor: "transparent" } }
      },
      compoundVariants: [{ size: "sm", intent: "primary", style: { borderWidth: 2 } }]
    })

    const result = variant({ size: "lg", intent: "primary" })

    expect(result).not.toHaveProperty("borderWidth")
  })

  test("applies multiple compound variants when all match", () => {
    const variant = createVariant({
      variants: {
        size: { sm: { padding: 8 } },
        intent: { primary: { backgroundColor: "blue" } }
      },
      compoundVariants: [
        { size: "sm", intent: "primary", style: { borderWidth: 2 } },
        { size: "sm", style: { borderRadius: 4 } }
      ]
    })

    const result = variant({ size: "sm", intent: "primary" })

    expect(result).toMatchObject({ borderWidth: 2, borderRadius: 4 })
  })

  test("handles boolean variant props", () => {
    const variant = createVariant({
      variants: {
        disabled: {
          true: { opacity: 0.5 },
          false: { opacity: 1 }
        }
      }
    })

    expect(variant({ disabled: true })).toEqual({ opacity: 0.5 })
    expect(variant({ disabled: false })).toEqual({ opacity: 1 })
  })

  test("returns empty object when no base and no matching variant", () => {
    const variant = createVariant({
      variants: {
        size: { sm: { padding: 8 } }
      }
    })

    expect(variant()).toEqual({})
  })

  test("returns same object reference from cache on repeated calls with identical props", () => {
    const variant = createVariant({
      variants: {
        size: { md: { padding: 12 } }
      }
    })

    const first = variant({ size: "md" })
    const second = variant({ size: "md" })

    expect(first).toBe(second)
  })

  test("returns different results for different props", () => {
    const variant = createVariant({
      variants: {
        size: { sm: { padding: 8 }, md: { padding: 12 } }
      }
    })

    expect(variant({ size: "sm" })).not.toEqual(variant({ size: "md" }))
  })

  test("is branded with VARIANT_MARKER symbol", () => {
    const variant = createVariant({ variants: {} })

    expect(VARIANT_MARKER in variant).toBe(true)
    expect((variant as unknown as Record<symbol, boolean>)[VARIANT_MARKER]).toBe(true)
  })

  test("exposes the original config on the function", () => {
    const config = {
      base: { borderRadius: 8 },
      variants: { size: { sm: { padding: 8 } } }
    }
    const variant = createVariant(config)

    expect((variant as unknown as Record<string, unknown>)["config"]).toBe(config)
  })
})
