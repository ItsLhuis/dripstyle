import { describe, expectTypeOf, test } from "vitest"

import { type StyleProp, type TextStyle, type ViewStyle } from "react-native"

import { imageStyle, textStyle, viewStyle } from "../styles"
import { StyleSheet } from "../stylesheet"
import { type ProcessedStyle, type ProcessedStyleSheet, type StyleSheetContext } from "../types"
import { createVariant } from "../variants"

describe("inline function styles", () => {
  test("preserves the full call signature of a single-arg function entry", () => {
    type Entry = (selected: boolean) => { opacity: number }

    type Result = ProcessedStyle<Entry>

    expectTypeOf<Result>().toEqualTypeOf<(selected: boolean) => { opacity: number }>()
  })

  test("preserves multi-arg signatures and their return type", () => {
    type Entry = (count: number, label: string) => { width: number }

    type Result = ProcessedStyle<Entry>

    expectTypeOf<Result>().toEqualTypeOf<(count: number, label: string) => { width: number }>()
  })

  test("keeps inline text style function returns assignable to StyleProp<TextStyle>", () => {
    const _sheet = StyleSheet.create(() => ({
      value: (options: { color: string; weight: "400" | "700" }) => ({
        color: options.color,
        fontSize: 32,
        fontWeight: options.weight
      })
    }))

    type Sheet = ProcessedStyleSheet<typeof _sheet>

    const styles = {} as Sheet
    const resolved: StyleProp<TextStyle> = styles.value({ color: "#111111", weight: "700" })

    expectTypeOf(resolved).toExtend<StyleProp<TextStyle>>()
  })

  test("keeps inline view style function returns assignable to StyleProp<ViewStyle>", () => {
    const _sheet = StyleSheet.create(() => ({
      button: (options: { selected: boolean; size: "sm" | "md" }) => ({
        alignItems: "center" as const,
        borderRadius: options.size === "sm" ? 8 : 12,
        flexDirection: "row" as const,
        opacity: options.selected ? 1 : 0.72,
        paddingHorizontal: options.size === "sm" ? 12 : 16
      })
    }))

    type Sheet = ProcessedStyleSheet<typeof _sheet>

    const styles = {} as Sheet
    const resolved: StyleProp<ViewStyle> = [
      styles.button({ selected: true, size: "md" }),
      { marginTop: 8 }
    ]

    expectTypeOf(resolved).toExtend<StyleProp<ViewStyle>>()
  })

  test("exposes inline function entries as callables on the processed sheet", () => {
    const _sheet = StyleSheet.create(() => ({
      row: { flexDirection: "row" as const },
      card: (selected: boolean) => ({ opacity: selected ? 1 : 0.5 })
    }))

    type Sheet = ProcessedStyleSheet<typeof _sheet>

    expectTypeOf<Sheet["card"]>().toEqualTypeOf<(selected: boolean) => { opacity: number }>()
    expectTypeOf<Sheet["row"]>().toEqualTypeOf<{ flexDirection: "row" }>()
  })

  test("keeps direct factory style objects assignable without const assertions", () => {
    const _sheet = StyleSheet.create(() => ({
      row: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%"
      }
    }))

    type Sheet = ProcessedStyleSheet<typeof _sheet>

    const styles = {} as Sheet
    const resolved: StyleProp<ViewStyle> = styles.row

    expectTypeOf(resolved).toExtend<StyleProp<ViewStyle>>()
  })

  test("flags invalid literal style values inside direct factory objects", () => {
    // @ts-expect-error sideways is not a valid flexDirection value
    StyleSheet.create(() => ({
      row: { flexDirection: "sideways" as const }
    }))
  })

  test("flags invalid style properties inside a direct factory object", () => {
    // @ts-expect-error notARealProp is not a valid React Native style property
    StyleSheet.create(() => ({
      y: { notARealProp: 1 }
    }))
  })

  test("keeps createVariant entries callable alongside inline function entries", () => {
    const _sheet = StyleSheet.create(() => ({
      button: createVariant({
        variants: { size: { sm: { padding: 8 }, md: { padding: 12 } } }
      }),
      card: (selected: boolean) => ({ opacity: selected ? 1 : 0 })
    }))

    type Sheet = ProcessedStyleSheet<typeof _sheet>

    expectTypeOf<Sheet["button"]>().toBeFunction()
    expectTypeOf<Sheet["button"]>().parameter(0).toExtend<{ size?: "sm" | "md" } | undefined>()
    expectTypeOf<Sheet["card"]>().toBeFunction()
    expectTypeOf<Sheet["card"]>().parameters.toEqualTypeOf<[selected: boolean]>()
  })

  test("flags invalid style properties inside an inline function with no wrapper", () => {
    // @ts-expect-error notARealProp is not a valid React Native style property
    StyleSheet.create(() => ({
      x: (toggled: boolean) => ({ notARealProp: toggled ? 1 : 2 })
    }))
  })

  test("contextually types direct factory objects: preserves literal values without as const", () => {
    const _sheet = StyleSheet.create(() => ({
      row: { flexDirection: "row", alignItems: "center" }
    }))

    type Sheet = ProcessedStyleSheet<typeof _sheet>

    expectTypeOf<Sheet["row"]>().toEqualTypeOf<{ flexDirection: "row"; alignItems: "center" }>()
  })

  test("contextually types inline function returns: preserves literal values without as const", () => {
    const _sheet = StyleSheet.create(() => ({
      row: (compact: boolean) => ({ flexDirection: "row", paddingHorizontal: compact ? 8 : 16 })
    }))

    type Sheet = ProcessedStyleSheet<typeof _sheet>

    expectTypeOf<Sheet["row"]>().returns.toEqualTypeOf<{
      flexDirection: "row"
      paddingHorizontal: number
    }>()
  })

  test("preserves the parameter list through StyleSheet.create + the processed sheet", () => {
    const _sheet = StyleSheet.create(({ theme: _theme }: StyleSheetContext) => ({
      card: (selected: boolean) => ({ opacity: selected ? 1 : 0.5 })
    }))

    type Sheet = ProcessedStyleSheet<typeof _sheet>

    expectTypeOf<Sheet["card"]>().parameters.toEqualTypeOf<[selected: boolean]>()
    expectTypeOf<Sheet["card"]>().returns.toEqualTypeOf<{ opacity: number }>()
  })
})

describe("optional style helpers", () => {
  test("viewStyle preserves the literal style type", () => {
    const result = viewStyle({ opacity: 1, flexDirection: "row" as const })

    expectTypeOf(result).toEqualTypeOf<{ opacity: number; flexDirection: "row" }>()
  })

  test("textStyle and imageStyle preserve their literal style types", () => {
    const text = textStyle({ color: "red" })
    const image = imageStyle({ opacity: 1 })

    expectTypeOf(text).toEqualTypeOf<{ color: string }>()
    expectTypeOf(image).toEqualTypeOf<{ opacity: number }>()
  })

  test("viewStyle pinpoints invalid properties inside the returned object", () => {
    viewStyle({
      // @ts-expect-error notARealProp is not a valid ViewStyle property
      notARealProp: 1
    })
  })

  test("preserves the inline function signature when wrapped with viewStyle", () => {
    const _sheet = StyleSheet.create(({ theme: _theme }: StyleSheetContext) => ({
      card: (selected: boolean) => viewStyle({ opacity: selected ? 1 : 0.5 })
    }))

    type Sheet = ProcessedStyleSheet<typeof _sheet>

    expectTypeOf<Sheet["card"]>().parameters.toEqualTypeOf<[selected: boolean]>()
    expectTypeOf<Sheet["card"]>().returns.toEqualTypeOf<{ opacity: number }>()
  })
})
