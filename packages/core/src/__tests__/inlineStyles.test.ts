import { describe, expect, test, vi } from "vitest"

import { processStyleSheet } from "../processing"

import { imageStyle, textStyle, viewStyle } from "../styles"
import { VARIANT_MARKER, type StyleSheetContext } from "../types"
import { createVariant } from "../variants"

vi.mock("react-native", () => ({
  StyleSheet: {
    create<T>(styles: T): T {
      return styles
    }
  }
}))

function makeContext(theme: Record<string, unknown>, bottomInset: number): StyleSheetContext {
  return {
    theme,
    runtime: { insets: { top: 0, right: 0, bottom: bottomInset, left: 0 } }
  } as StyleSheetContext
}

describe("inline function styles at runtime", () => {
  test("returns the correct style object for each argument value", () => {
    const definition = () => ({
      card: (selected: boolean) => ({ opacity: selected ? 1 : 0.5 })
    })

    const sheet = processStyleSheet(definition, makeContext({}, 0))

    expect(sheet.card(true)).toEqual({ opacity: 1 })
    expect(sheet.card(false)).toEqual({ opacity: 0.5 })
  })

  test("captures theme via closure and reflects the active theme", () => {
    const definition = ({ theme }: StyleSheetContext) => ({
      card: (selected: boolean) => ({
        borderColor: selected ? (theme as { primary: string }).primary : "transparent"
      })
    })

    const light = processStyleSheet(definition, makeContext({ primary: "#ffffff" }, 0))
    const dark = processStyleSheet(definition, makeContext({ primary: "#000000" }, 0))

    expect(light.card(true)).toEqual({ borderColor: "#ffffff" })
    expect(dark.card(true)).toEqual({ borderColor: "#000000" })
  })

  test("returns a freshly-closed function reference when theme changes", () => {
    const definition = ({ theme }: StyleSheetContext) => ({
      card: (selected: boolean) => ({
        borderColor: selected ? (theme as { primary: string }).primary : "transparent"
      })
    })

    const light = processStyleSheet(definition, makeContext({ primary: "#ffffff" }, 0))
    const dark = processStyleSheet(definition, makeContext({ primary: "#000000" }, 0))

    expect(light.card).not.toBe(dark.card)
    expect(light.card(true)).toEqual({ borderColor: "#ffffff" })
    expect(dark.card(true)).toEqual({ borderColor: "#000000" })
  })

  test("captures runtime values via closure", () => {
    const definition = ({ runtime }: StyleSheetContext) => ({
      content: (isEmpty: boolean) => ({
        paddingBottom: isEmpty ? runtime.insets.bottom + 16 : 8
      })
    })

    const sheet = processStyleSheet(definition, makeContext({}, 24))

    expect(sheet.content(true)).toEqual({ paddingBottom: 40 })
    expect(sheet.content(false)).toEqual({ paddingBottom: 8 })
  })

  test("forwards every argument to a multi-arg inline function", () => {
    const definition = () => ({
      spacer: (top: number, bottom: number) => ({ paddingTop: top, paddingBottom: bottom })
    })

    const sheet = processStyleSheet(definition, makeContext({}, 0))

    expect(sheet.spacer(4, 8)).toEqual({ paddingTop: 4, paddingBottom: 8 })
  })

  test("passes inline function entries through untouched", () => {
    const raw = { opacity: 1 }
    const definition = () => {
      const card = (_selected: boolean) => raw
      ;(card as unknown as { marker: string }).marker = "kept"

      return { card }
    }

    const sheet = processStyleSheet(definition, makeContext({}, 0))

    expect((sheet.card as unknown as { marker: string }).marker).toBe("kept")
    expect(sheet.card(true)).toBe(raw)
  })

  test("still passes createVariant entries through and keeps them callable", () => {
    const variant = createVariant({
      variants: { size: { sm: { padding: 8 }, md: { padding: 12 } } }
    })
    const definition = () => ({ button: variant })

    const sheet = processStyleSheet(definition, makeContext({}, 0))

    expect(sheet.button).toBe(variant)
    expect(VARIANT_MARKER in (sheet.button as object)).toBe(true)
    expect(sheet.button({ size: "sm" })).toEqual({ padding: 8 })
  })

  test("still processes static object entries", () => {
    const definition = () => ({ row: { flexDirection: "row" as const } })

    const sheet = processStyleSheet(definition, makeContext({}, 0))

    expect(sheet.row).toEqual({ flexDirection: "row" })
  })

  test("optional style helpers return their argument unchanged", () => {
    const view = { opacity: 1 }
    const text = { color: "red" }
    const image = { opacity: 0.5 }

    expect(viewStyle(view)).toBe(view)
    expect(textStyle(text)).toBe(text)
    expect(imageStyle(image)).toBe(image)
  })
})
