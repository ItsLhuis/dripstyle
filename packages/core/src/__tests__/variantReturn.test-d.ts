import { expectTypeOf, test } from "vitest"

import { type ImageStyle, type StyleProp, type TextStyle, type ViewStyle } from "react-native"

import { StyleSheet } from "../stylesheet"
import { type VariantStyleType } from "../types"
import { createVariant } from "../variants"
import { useStyles } from "../hooks"

// Regression guard for the 1.2.0 collapse: `V[keyof V][keyof V[keyof V] & string]`
// resolved to `never` when variant dimensions had non-overlapping keys (keyof of a
// union is the intersection of its members' keys), so the variant return type fell
// back to the wide `ViewStyle | TextStyle | ImageStyle` union. That union is not
// assignable to a concrete `StyleProp<ViewStyle>` / `StyleProp<TextStyle>`, which broke
// every consumer component that spread a variant result into an RN `style` prop.

test("VariantStyleType unions concrete styles across non-overlapping dimensions", () => {
  type V = {
    variant: { primary: { backgroundColor: string }; ghost: { opacity: number } }
    size: { sm: { padding: number }; lg: { padding: number } }
  }

  expectTypeOf<VariantStyleType<V>>().toEqualTypeOf<
    { backgroundColor: string } | { opacity: number } | { padding: number }
  >()
})

test("VariantStyleType does not collapse to the wide style union", () => {
  type V = {
    variant: { primary: { backgroundColor: string }; ghost: { opacity: number } }
    size: { sm: { padding: number }; lg: { minHeight: number } }
  }

  expectTypeOf<VariantStyleType<V>>().not.toEqualTypeOf<ViewStyle | TextStyle | ImageStyle>()
})

test("multi-dimension variant return is assignable to StyleProp<ViewStyle>", () => {
  const buttonStyles = StyleSheet.create(() => ({
    button: createVariant({
      base: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      },
      variants: {
        variant: {
          primary: { backgroundColor: "blue" },
          outline: { backgroundColor: "transparent", borderWidth: 1, borderColor: "gray" },
          ghost: { backgroundColor: "transparent" }
        },
        size: {
          sm: { paddingVertical: 8, paddingHorizontal: 12, minHeight: 36 },
          md: { paddingVertical: 12, paddingHorizontal: 20, minHeight: 44 },
          lg: { paddingVertical: 16, paddingHorizontal: 32, minHeight: 52 }
        }
      },
      defaultVariants: { variant: "primary", size: "md" }
    })
  }))

  const styles = useStyles(buttonStyles)

  const resolved: StyleProp<ViewStyle> = styles.button({ variant: "primary", size: "md" })

  expectTypeOf(resolved).toExtend<StyleProp<ViewStyle>>()
})

test("single-dimension variant return is assignable to StyleProp<ViewStyle>", () => {
  const cardStyles = StyleSheet.create(() => ({
    card: createVariant({
      base: { backgroundColor: "white", flexDirection: "row" },
      variants: {
        tone: {
          default: { backgroundColor: "white" },
          active: { backgroundColor: "gray" }
        }
      },
      defaultVariants: { tone: "default" }
    })
  }))

  const styles = useStyles(cardStyles)

  const resolved: StyleProp<ViewStyle> = styles.card({ tone: "default" })

  expectTypeOf(resolved).toExtend<StyleProp<ViewStyle>>()
})

test("text variant return with a computed color dimension is assignable to StyleProp<TextStyle>", () => {
  const colorVariants = { foreground: { color: "#000" }, muted: { color: "#888" } } as Record<
    string,
    { color: string }
  >

  const textStyles = StyleSheet.create(() => ({
    text: createVariant({
      base: {},
      variants: {
        variant: {
          body: { fontSize: 16 },
          caption: { fontSize: 12 }
        },
        weight: {
          regular: { fontWeight: "400" as const },
          bold: { fontWeight: "700" as const }
        },
        color: colorVariants
      },
      defaultVariants: { variant: "body", weight: "regular", color: "foreground" }
    })
  }))

  const styles = useStyles(textStyles)

  const resolved: StyleProp<TextStyle> = styles.text({
    variant: "body",
    weight: "bold",
    color: "foreground"
  })

  expectTypeOf(resolved).toExtend<StyleProp<TextStyle>>()
})

// Regression guard: a variant with empty option objects + a compoundVariant, defined inside a
// factory, must still return its concrete style and stay assignable to StyleProp<ViewStyle>.

test("variant with empty options and a compoundVariant stays assignable to StyleProp<ViewStyle>", () => {
  const buttonStyles = StyleSheet.create(() => ({
    actionButton: createVariant({
      base: { flexDirection: "row", alignItems: "center" },
      variants: {
        intent: {
          primary: { backgroundColor: "blue" },
          quiet: { backgroundColor: "transparent" }
        },
        selected: { true: {}, false: {} }
      },
      compoundVariants: [{ intent: "quiet", selected: "true", style: { backgroundColor: "gray" } }],
      defaultVariants: { intent: "primary", selected: false }
    })
  }))

  const styles = useStyles(buttonStyles)

  const resolved: StyleProp<ViewStyle> = styles.actionButton({ intent: "primary", selected: true })

  expectTypeOf(resolved).toExtend<StyleProp<ViewStyle>>()
})
