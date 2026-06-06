import {
  StyleSheet as RNStyleSheet,
  type ImageStyle,
  type TextStyle,
  type ViewStyle
} from "react-native"

import {
  type ProcessedStyleSheet,
  type StyleSheetContext,
  type StyleSheetDefinition
} from "./types"

type StyleValue = ViewStyle | TextStyle | ImageStyle

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StyleFunction = (...args: any[]) => StyleValue

/**
 * Processes a stylesheet definition into bridge-optimized styles.
 *
 * - Plain objects (pre-processed by `StyleSheet.create()`) are returned as-is.
 * - Factory functions are called with the given context, then their output is split:
 *   static style objects run through `RN.StyleSheet.create()`, while every function entry
 *   (a `createVariant()` result or an inline user-arg style function) is passed through
 *   untouched. Function entries are never invoked or re-registered here — they stay callable
 *   and close over `theme`/`runtime` from the factory invocation above.
 */
export function processStyleSheet<T extends StyleSheetDefinition>(
  definition: T,
  context: StyleSheetContext
): ProcessedStyleSheet<T> {
  if (typeof definition === "function") {
    const rawStyles = definition(context)

    return processRawStyles(rawStyles) as ProcessedStyleSheet<T>
  }

  // Already an RN.StyleSheet result (plain object path) — return as-is.
  // Double cast required: T extends StyleSheetDefinition which includes function types,
  // so TS cannot prove the plain-object branch satisfies ProcessedStyleSheet<T>.
  return definition as unknown as ProcessedStyleSheet<T>
}

function processRawStyles(
  rawStyles: Record<string, unknown>
): Record<string, StyleValue | StyleFunction> {
  const staticStyles: Record<string, StyleValue> = {}
  const functionEntries: Array<[string, StyleFunction]> = []

  for (const [key, value] of Object.entries(rawStyles)) {
    if (typeof value === "function") {
      functionEntries.push([key, value as StyleFunction])

      continue
    }

    staticStyles[key] = value as StyleValue
  }

  const processedStatics =
    Object.keys(staticStyles).length > 0
      ? RNStyleSheet.create(staticStyles as Record<string, Record<string, unknown>>)
      : {}

  const result: Record<string, StyleValue | StyleFunction> = {
    ...(processedStatics as Record<string, StyleValue>)
  }

  for (const [key, fn] of functionEntries) {
    result[key] = fn
  }

  return result
}
