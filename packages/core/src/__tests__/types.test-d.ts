import { describe, expectTypeOf, test } from "vitest"

import {
  VARIANT_MARKER,
  type ExtractVariantValues,
  type MarkedVariantFunction,
  type ProcessedStyle,
  type StyleSheetContext,
  type StyleVariants,
  type VariantsConfig
} from "../types"
import { createVariant } from "../variants"

describe("ProcessedStyle", () => {
  test("preserves MarkedVariantFunction type unchanged", () => {
    const _variant = createVariant({
      variants: {
        size: { sm: { padding: 8 as const }, md: { padding: 12 as const } }
      }
    })

    type Result = ProcessedStyle<typeof _variant>

    expectTypeOf<Result>().toEqualTypeOf<typeof _variant>()
  })

  test("preserves a per-key function signature instead of auto-invoking it", () => {
    const _factory = (_ctx: StyleSheetContext) => ({ padding: 8 as const })

    type Result = ProcessedStyle<typeof _factory>

    expectTypeOf<Result>().toBeFunction()
    expectTypeOf<Result>().returns.toEqualTypeOf<{ padding: 8 }>()
  })

  test("preserves static style object type unchanged", () => {
    const _style = { padding: 8 as const, borderRadius: 4 as const }

    type Result = ProcessedStyle<typeof _style>

    expectTypeOf<Result>().toEqualTypeOf<{ padding: 8; borderRadius: 4 }>()
  })
})

describe("StyleVariants", () => {
  test("extracts optional variant prop types from stylesheet factory", () => {
    const _stylesheet = () => ({
      button: createVariant({
        variants: {
          size: {
            sm: { padding: 8 },
            md: { padding: 12 },
            lg: { padding: 16 }
          }
        }
      })
    })

    type ButtonVariants = StyleVariants<typeof _stylesheet, "button">

    expectTypeOf<ButtonVariants>().toEqualTypeOf<{
      readonly size?: "sm" | "md" | "lg" | undefined
    }>()
  })

  test("exposes boolean as variant prop type when all keys are true/false", () => {
    const _stylesheet = () => ({
      button: createVariant({
        variants: {
          disabled: {
            true: { opacity: 0.5 },
            false: { opacity: 1 }
          }
        }
      })
    })

    type ButtonVariants = StyleVariants<typeof _stylesheet, "button">

    expectTypeOf<ButtonVariants>().toEqualTypeOf<{
      readonly disabled?: boolean | undefined
    }>()
  })
})

describe("ExtractVariantValues", () => {
  test("extracts value union for a single named dimension", () => {
    const _stylesheet = () => ({
      button: createVariant({
        variants: {
          size: { sm: { padding: 8 }, md: { padding: 12 } },
          intent: { primary: { backgroundColor: "blue" }, ghost: {} }
        }
      })
    })

    type SizeValues = ExtractVariantValues<typeof _stylesheet, "button", "size">
    type IntentValues = ExtractVariantValues<typeof _stylesheet, "button", "intent">

    expectTypeOf<SizeValues>().toEqualTypeOf<"sm" | "md">()
    expectTypeOf<IntentValues>().toEqualTypeOf<"primary" | "ghost">()
  })

  test("resolves to never for a dimension that does not exist", () => {
    const _stylesheet = () => ({
      button: createVariant({
        variants: { size: { sm: { padding: 8 } } }
      })
    })

    type MissingDimension = ExtractVariantValues<typeof _stylesheet, "button", "intent">

    expectTypeOf<MissingDimension>().toEqualTypeOf<never>()
  })
})

describe("MarkedVariantFunction", () => {
  test("is callable and returns style object", () => {
    const variant = createVariant({
      variants: { size: { sm: { padding: 8 } } }
    })

    expectTypeOf(variant).toBeFunction()
  })

  test("VARIANT_MARKER property is typed as true", () => {
    const variant = createVariant({ variants: {} })

    expectTypeOf(variant[VARIANT_MARKER]).toEqualTypeOf<true>()
  })

  test("is assignable to MarkedVariantFunction", () => {
    const variant = createVariant({
      variants: { size: { sm: { padding: 8 } } }
    })

    expectTypeOf(variant).toExtend<MarkedVariantFunction<VariantsConfig, Record<never, never>>>()
  })
})
