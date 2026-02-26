import { converter, formatHex, formatRgb, interpolate, parse } from "culori"

/**
 * Adds or replaces the alpha channel of an RGB/RGBA color string.
 * Uses string manipulation only — no culori dependency. Safe in worklets.
 *
 * @param color - An "rgb(r, g, b)" or "rgba(r, g, b, a)" string
 * @param opacity - Opacity value between 0 and 1
 * @returns An "rgba(r, g, b, opacity)" string
 *
 * @example
 * withOpacity("rgb(255, 0, 0)", 0.5) // → "rgba(255, 0, 0, 0.5)"
 * withOpacity("rgba(255, 0, 0, 1)", 0.3) // → "rgba(255, 0, 0, 0.3)"
 */
export function withOpacity(color: string, opacity: number): string {
  "worklet"

  const clamped = Math.max(0, Math.min(1, opacity))

  if (color.startsWith("rgba(")) {
    return color.replace(/[\d.]+\)$/, `${clamped})`)
  }

  if (color.startsWith("rgb(")) {
    return color.replace("rgb(", "rgba(").replace(")", `, ${clamped})`)
  }

  return color
}

/**
 * Alias for withOpacity. Adds or replaces the alpha channel.
 *
 * @param color - An "rgb(r, g, b)" or "rgba(r, g, b, a)" string
 * @param opacity - Opacity value between 0 and 1
 * @returns An "rgba(r, g, b, opacity)" string
 *
 * @example
 * alpha("rgb(255, 0, 0)", 0.5) // → "rgba(255, 0, 0, 0.5)"
 *
 * @see withOpacity
 */
export function alpha(color: string, opacity: number): string {
  "worklet"

  return withOpacity(color, opacity)
}

/**
 * Increases the perceptual lightness of a color using the LCH color space.
 *
 * @param color - Any CSS color string
 * @param amount - Amount to lighten (0–1, where 1 = maximum white)
 * @returns An "rgb(r, g, b)" string
 *
 * @example
 * lighten("rgb(100, 100, 100)", 0.1) // → lighter gray
 */
export function lighten(color: string, amount: number): string {
  "worklet"

  try {
    const parsed = parse(color)

    if (!parsed) return color

    const toLch = converter("lch")
    const lch = toLch(parsed)

    if (!lch) return color

    const lightened = { ...lch, l: Math.min(100, lch.l + amount * 100) }

    return formatRgb(lightened) || color
  } catch {
    return color
  }
}

/**
 * Decreases the perceptual lightness of a color using the LCH color space.
 *
 * @param color - Any CSS color string
 * @param amount - Amount to darken (0–1, where 1 = maximum black)
 * @returns An "rgb(r, g, b)" string
 *
 * @example
 * darken("rgb(200, 200, 200)", 0.1) // → darker gray
 */
export function darken(color: string, amount: number): string {
  "worklet"

  try {
    const parsed = parse(color)

    if (!parsed) return color

    const toLch = converter("lch")
    const lch = toLch(parsed)

    if (!lch) return color

    const darkened = { ...lch, l: Math.max(0, lch.l - amount * 100) }

    return formatRgb(darkened) || color
  } catch {
    return color
  }
}

/**
 * Mixes two colors in RGB space.
 *
 * @param color1 - First color (any CSS color string)
 * @param color2 - Second color (any CSS color string)
 * @param weight - Mix weight (0 = all color2, 1 = all color1, default 0.5)
 * @returns An "rgb(r, g, b)" string
 *
 * @example
 * mix("rgb(255, 0, 0)", "rgb(0, 0, 255)") // → "rgb(128, 0, 128)"
 * mix("rgb(255, 0, 0)", "rgb(0, 0, 255)", 0.25) // → 25% red, 75% blue
 */
export function mix(color1: string, color2: string, weight = 0.5): string {
  "worklet"

  try {
    const clamped = Math.max(0, Math.min(1, weight))
    const interpolator = interpolate([color1, color2], "rgb")
    const mixed = interpolator(1 - clamped)

    return formatRgb(mixed) || color1
  } catch {
    return color1
  }
}

/**
 * Returns black or white based on WCAG relative luminance of the background color.
 * Chooses whichever has higher contrast ratio against the background.
 *
 * @param background - Background color (any CSS color string)
 * @returns "#000000" for light backgrounds, "#ffffff" for dark backgrounds
 *
 * @example
 * contrastColor("rgb(255, 255, 255)") // → "#000000"
 * contrastColor("rgb(0, 0, 0)") // → "#ffffff"
 * contrastColor("rgb(255, 200, 0)") // → "#000000" (yellow is light)
 */
export function contrastColor(background: string): "#000000" | "#ffffff" {
  const parsed = parse(background)

  if (!parsed) return "#000000"

  const toRgb = converter("rgb")
  const rgb = toRgb(parsed)

  if (!rgb) return "#000000"

  const r = rgb.r
  const g = rgb.g
  const b = rgb.b

  const linearize = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

  const luminance = 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)

  const contrastWithWhite = 1.05 / (luminance + 0.05)
  const contrastWithBlack = (luminance + 0.05) / 0.05

  return contrastWithBlack >= contrastWithWhite ? "#000000" : "#ffffff"
}

/**
 * Returns true if the color is perceptually light.
 *
 * @param color - Any CSS color string
 * @returns true for light colors, false for dark colors
 *
 * @example
 * isLight("rgb(255, 255, 255)") // → true
 * isLight("rgb(0, 0, 0)") // → false
 */
export function isLight(color: string): boolean {
  return contrastColor(color) === "#000000"
}

/**
 * Converts any CSS color string to a hex string.
 *
 * @param color - Any CSS color string (rgb, rgba, hsl, etc.)
 * @returns A "#rrggbb" hex string
 *
 * @example
 * toHex("rgb(255, 0, 0)") // → "#ff0000"
 */
export function toHex(color: string): string {
  const parsed = parse(color)

  if (!parsed) return color

  return formatHex(parsed) || color
}

/**
 * Parses any CSS color string into its RGBA components.
 *
 * @param color - Any CSS color string
 * @returns An object with r (0–255), g (0–255), b (0–255), a (0–1)
 *
 * @example
 * parseColor("rgb(255, 0, 0)") // → { r: 255, g: 0, b: 0, a: 1 }
 * parseColor("#ff0000") // → { r: 255, g: 0, b: 0, a: 1 }
 */
export function parseColor(color: string): { r: number; g: number; b: number; a: number } {
  const parsed = parse(color)

  if (!parsed) return { r: 0, g: 0, b: 0, a: 1 }

  const toRgb = converter("rgb")
  const rgb = toRgb(parsed)

  if (!rgb) return { r: 0, g: 0, b: 0, a: 1 }

  return {
    r: Math.round(rgb.r * 255),
    g: Math.round(rgb.g * 255),
    b: Math.round(rgb.b * 255),
    a: rgb.alpha ?? 1
  }
}
