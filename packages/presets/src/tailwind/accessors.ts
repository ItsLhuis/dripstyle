import {
  aspectRatioTokens,
  borderRadiusTokens,
  borderWidthTokens,
  durationTokens,
  easingTokens,
  fontSizeTokens,
  fontWeightTokens,
  letterSpacingTokens,
  lineHeightTokens,
  opacityTokens,
  shadowTokens,
  sizeTokens,
  spacingTokens,
  zIndexTokens,
  type AspectRatioAlias,
  type BorderRadiusAlias,
  type BorderWidthAlias,
  type DurationAlias,
  type EasingAlias,
  type FontSizeAlias,
  type FontWeightAlias,
  type LetterSpacingAlias,
  type LineHeightAlias,
  type OpacityAlias,
  type ShadowAlias,
  type SizeAlias,
  type SpacingAlias,
  type ZIndexAlias
} from "./tokens"

type ShadowStyle = {
  shadowColor: string
  shadowOffset: { width: number; height: number }
  shadowOpacity: number
  shadowRadius: number
  elevation: number
}

/**
 * Returns a spacing value in pixels.
 * Named keys map to Tailwind spacing scale (4px base unit).
 * Numbers are multiplied by 4 (e.g., space(2) → 8).
 *
 * @param value - A spacing alias ("1", "2.5", "px") or a raw number multiplier
 * @returns Pixel value
 *
 * @example
 * space("4") // → 16
 * space(4)   // → 16 (number input: n × 4)
 * space("px") // → 1
 */
export const space = (value?: SpacingAlias | number): number => {
  "worklet"

  if (value === undefined) return spacingTokens[4]

  if (typeof value === "number") return value * 4

  return spacingTokens[value as SpacingAlias]
}

/**
 * Returns a size value. Extends the spacing scale with special values.
 * Pass `runtime` to resolve `"screen"` to the current window width.
 *
 * @param value - A size alias, `"screen"`, or a raw number multiplier
 * @param runtime - Optional runtime object; required when `value` is `"screen"`
 * @returns Size value in pixels or a CSS string ("auto", "100%")
 *
 * @example
 * size("full") // → "100%"
 * size("auto") // → "auto"
 * size(10)     // → 40 (10 × 4)
 * size("screen", runtime) // → runtime.window.width
 */
export const size = (
  value?: SizeAlias | "screen" | number,
  runtime?: { window: { width: number; height: number } }
): number | string => {
  "worklet"

  if (value === undefined) return sizeTokens[4]

  if (value === "screen") return runtime?.window.width ?? 0

  if (typeof value === "number") return value * 4

  return sizeTokens[value as SizeAlias]
}

/**
 * Returns a font size value in pixels.
 *
 * @param key - A font size alias
 * @returns Font size in pixels
 *
 * @example
 * fontSize("base") // → 16
 * fontSize("2xl") // → 24
 */
export const fontSize = (key?: FontSizeAlias): number => {
  "worklet"

  if (key === undefined) return fontSizeTokens.base

  return fontSizeTokens[key]
}

/**
 * Returns a line height value (unitless multiplier or absolute pixels).
 *
 * @param key - A line height alias
 * @returns Line height value
 *
 * @example
 * lineHeight("normal") // → 1.5
 * lineHeight("6") // → 24 (absolute pixels)
 */
export const lineHeight = (key?: LineHeightAlias): number => {
  "worklet"

  if (key === undefined) return lineHeightTokens.normal

  return lineHeightTokens[key]
}

/**
 * Returns a font weight string.
 *
 * @param key - A font weight alias
 * @returns Font weight as a string (e.g., "700")
 *
 * @example
 * fontWeight("bold") // → "700"
 * fontWeight("medium") // → "500"
 */
export const fontWeight = (key?: FontWeightAlias): string => {
  "worklet"

  if (key === undefined) return fontWeightTokens.normal

  return fontWeightTokens[key]
}

/**
 * Returns a letter spacing value in pixels.
 *
 * @param key - A letter spacing alias
 * @returns Letter spacing in pixels
 *
 * @example
 * letterSpacing("wide") // → 0.4
 * letterSpacing("tight") // → -0.4
 */
export const letterSpacing = (key?: LetterSpacingAlias): number => {
  "worklet"

  if (key === undefined) return letterSpacingTokens.normal

  return letterSpacingTokens[key]
}

/**
 * Returns a border radius value in pixels.
 *
 * @param key - A border radius alias
 * @returns Border radius in pixels
 *
 * @example
 * radius("lg") // → 8
 * radius("full") // → 9999
 */
export const radius = (key?: BorderRadiusAlias): number => {
  "worklet"

  if (key === undefined) return borderRadiusTokens.md

  return borderRadiusTokens[key]
}

/**
 * Returns a React Native shadow style object.
 * Includes both iOS shadow properties and Android elevation.
 *
 * @param key - A shadow alias
 * @returns Shadow style object with `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, and `elevation`
 *
 * @example
 * shadow("md") // → { shadowColor: "rgb(0, 0, 0)", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5 }
 * shadow("none") // → { shadowColor: "transparent", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 }
 */
export const shadow = (key?: ShadowAlias): ShadowStyle => {
  "worklet"

  if (key === undefined) return shadowTokens.none

  return shadowTokens[key]
}

/**
 * Returns an opacity value (0–1).
 *
 * @param value - An opacity alias (0–100)
 * @returns Opacity as a decimal (0–1)
 *
 * @example
 * opacity(50) // → 0.5
 * opacity(100) // → 1
 */
export const opacity = (value?: OpacityAlias): number => {
  "worklet"

  if (value === undefined) return opacityTokens[100]

  return opacityTokens[value]
}

/**
 * Returns a z-index value.
 *
 * @param key - A z-index alias or a raw number
 * @returns Z-index value
 *
 * @example
 * zIndex("modal") // → 1050
 * zIndex("dropdown") // → 1000
 * zIndex(10) // → 10
 */
export const zIndex = (key?: ZIndexAlias | number): number => {
  "worklet"

  if (key === undefined) return zIndexTokens.base

  if (typeof key === "number") return key

  return zIndexTokens[key]
}

/**
 * Returns a border width value in pixels.
 *
 * @param key - A border width alias
 * @returns Border width in pixels
 *
 * @example
 * borderWidth("base") // → 1
 * borderWidth("md") // → 2
 */
export const borderWidth = (key?: BorderWidthAlias): number => {
  "worklet"

  if (key === undefined) return borderWidthTokens.base

  return borderWidthTokens[key]
}

/**
 * Returns an aspect ratio numeric value.
 *
 * @param key - An aspect ratio alias
 * @returns Aspect ratio as a decimal
 *
 * @example
 * aspectRatio("video") // → 1.7778 (16/9)
 * aspectRatio("square") // → 1
 */
export const aspectRatio = (key?: AspectRatioAlias): number => {
  "worklet"

  if (key === undefined) return aspectRatioTokens.square

  return aspectRatioTokens[key]
}

/**
 * Returns an animation duration in milliseconds.
 *
 * @param value - A duration alias in milliseconds
 * @returns Duration in milliseconds
 *
 * @example
 * duration(300) // → 300
 * duration(150) // → 150
 */
export const duration = (value?: DurationAlias): number => {
  "worklet"

  if (value === undefined) return durationTokens[300]

  return durationTokens[value]
}

/**
 * Returns a cubic-bezier easing array [x1, y1, x2, y2].
 *
 * @param key - An easing alias
 * @returns Cubic-bezier control points as a 4-tuple
 *
 * @example
 * easing("out") // → [0, 0, 0.2, 1]
 * easing("inOut") // → [0.4, 0, 0.2, 1]
 */
export const easing = (key?: EasingAlias): [number, number, number, number] => {
  "worklet"

  if (key === undefined) return easingTokens.inOut

  return easingTokens[key]
}
