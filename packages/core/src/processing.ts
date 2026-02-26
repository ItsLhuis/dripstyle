import { StyleSheet as RNStyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from "react-native"

import {
  VARIANT_MARKER,
  type ProcessedStyleSheet,
  type StyleSheetContext,
  type StyleSheetDefinition,
  type MarkedVariantFunction,
  type VariantsConfig,
  type DefaultVariants,
} from "./types"

type StyleValue = ViewStyle | TextStyle | ImageStyle

/**
 * Processes a stylesheet definition into bridge-optimized styles.
 *
 * - Plain objects (pre-processed by `StyleSheet.create()`) are returned as-is.
 * - Factory functions are called with the given context, then their output is
 *   separated into static styles, variant functions, and dynamic style functions.
 */
export function processStyleSheet<T extends StyleSheetDefinition>(
  definition: T,
  context: StyleSheetContext
): ProcessedStyleSheet<T> {
  if (typeof definition === "function") {
    const rawStyles = definition(context)

    return processRawStyles(rawStyles) as ProcessedStyleSheet<T>
  }

  // Already an RN.StyleSheet result (plain object path) — return as-is
  return definition as unknown as ProcessedStyleSheet<T>
}

function processRawStyles(
  rawStyles: Record<string, StyleValue | MarkedVariantFunction<VariantsConfig, DefaultVariants<VariantsConfig>> | ((ctx: StyleSheetContext) => StyleValue)>
): Record<string, StyleValue | MarkedVariantFunction<VariantsConfig, DefaultVariants<VariantsConfig>> | ((ctx: StyleSheetContext) => StyleValue)> {
  const staticStyles: Record<string, StyleValue> = {}
  const dynamicEntries: Array<[string, (ctx: StyleSheetContext) => StyleValue]> = []
  const variantEntries: Array<[string, MarkedVariantFunction<VariantsConfig, DefaultVariants<VariantsConfig>>]> = []

  for (const [key, value] of Object.entries(rawStyles)) {
    if (typeof value === "function" && VARIANT_MARKER in value) {
      variantEntries.push([key, value as MarkedVariantFunction<VariantsConfig, DefaultVariants<VariantsConfig>>])
    } else if (typeof value === "function") {
      dynamicEntries.push([key, value as (ctx: StyleSheetContext) => StyleValue])
    } else {
      staticStyles[key] = value
    }
  }

  const processedStatics =
    Object.keys(staticStyles).length > 0
      ? RNStyleSheet.create(staticStyles as Record<string, Record<string, unknown>>)
      : {}

  const result: Record<string, StyleValue | MarkedVariantFunction<VariantsConfig, DefaultVariants<VariantsConfig>> | ((ctx: StyleSheetContext) => StyleValue)> = {
    ...(processedStatics as Record<string, StyleValue>),
  }

  for (const [key, fn] of variantEntries) {
    result[key] = fn
  }

  for (const [key, fn] of dynamicEntries) {
    result[key] = (ctx: StyleSheetContext) => {
      const style = fn(ctx)

      return (RNStyleSheet.create({ s: style as Record<string, unknown> }) as { s: StyleValue }).s
    }
  }

  return result
}
