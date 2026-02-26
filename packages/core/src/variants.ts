import type { ImageStyle, TextStyle, ViewStyle } from "react-native"

import {
  VARIANT_MARKER,
  type DefaultVariants,
  type MarkedVariantFunction,
  type VariantConfig,
  type VariantFunction,
  type VariantProps,
  type VariantsConfig,
} from "./types"

type StyleValue = ViewStyle | TextStyle | ImageStyle

/**
 * Creates a variant function with Map-based result caching.
 *
 * Returns a callable function branded with `VARIANT_MARKER` so the
 * processing pipeline passes it through without `RN.StyleSheet.create()`.
 *
 * @example
 * ```ts
 * const buttonVariant = createVariant({
 *   base: { borderRadius: 8 },
 *   variants: {
 *     size: { sm: { padding: 8 }, md: { padding: 12 }, lg: { padding: 16 } },
 *   },
 *   defaultVariants: { size: "md" },
 * })
 * ```
 */
export function createVariant<
  const V extends VariantsConfig,
  D extends DefaultVariants<V> = DefaultVariants<V>,
>(config: VariantConfig<V>): MarkedVariantFunction<V, D> {
  const cache = new Map<string, StyleValue>()

  const variantFunction: VariantFunction<V, D> = (
    props = {} as VariantProps<V, D>
  ) => {
    const resolvedProps = { ...config.defaultVariants, ...props }
    const cacheKey = JSON.stringify(resolvedProps)

    const cached = cache.get(cacheKey)

    if (cached !== undefined) {
      return cached
    }

    const result = computeVariantStyle(config, resolvedProps as Record<string, string | boolean>)
    cache.set(cacheKey, result)

    return result
  }

  Object.defineProperty(variantFunction, VARIANT_MARKER, {
    value: true,
    writable: false,
    enumerable: false,
    configurable: false,
  })

  Object.defineProperty(variantFunction, "config", {
    value: config,
    writable: false,
    enumerable: false,
    configurable: false,
  })

  return variantFunction as MarkedVariantFunction<V, D>
}

function computeVariantStyle<V extends VariantsConfig>(
  config: VariantConfig<V>,
  props: Record<string, string | boolean>
): StyleValue {
  const styles: StyleValue[] = []

  if (config.base) {
    styles.push(config.base)
  }

  for (const [variantKey, variantValues] of Object.entries(config.variants)) {
    const propValue = props[variantKey]

    if (propValue !== undefined) {
      const lookupKey = typeof propValue === "boolean" ? String(propValue) : propValue
      const variantStyle = variantValues[lookupKey]

      if (variantStyle) {
        styles.push(variantStyle)
      }
    }
  }

  if (config.compoundVariants) {
    for (const compound of config.compoundVariants) {
      const { style, ...conditions } = compound

      const matches = Object.entries(conditions).every(([key, value]) => {
        const propValue = props[key]
        return String(propValue) === String(value)
      })

      if (matches) {
        styles.push(style)
      }
    }
  }

  return Object.assign({}, ...styles) as StyleValue
}
