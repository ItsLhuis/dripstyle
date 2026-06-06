import type {
  aspectRatio,
  borderWidth,
  duration,
  easing,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  opacity,
  radius,
  shadow,
  size,
  space,
  zIndex
} from "./accessors"

/**
 * Semantic color tokens for the Tailwind preset.
 * All values are CSS color strings (rgb() format).
 */
export type Colors = {
  // Surfaces
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  // Brand
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  // States
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  // UI Chrome
  border: string
  input: string
  ring: string
  // Charts
  chart1: string
  chart2: string
  chart3: string
  chart4: string
  chart5: string
  // Tab Bar
  tabbar: string
  tabbarForeground: string
  tabbarPrimary: string
  tabbarPrimaryForeground: string
  tabbarAccent: string
  tabbarAccentForeground: string
  tabbarBorder: string
  tabbarRing: string
  // Feedback — Info
  info: string
  infoForeground: string
  infoBorder: string
  // Feedback — Success
  success: string
  successForeground: string
  successBorder: string
  // Feedback — Warning
  warning: string
  warningForeground: string
  warningBorder: string
  // Feedback — Error
  error: string
  errorForeground: string
  errorBorder: string
}

/**
 * Complete Tailwind theme shape: semantic colors + token accessor functions.
 */
export type TailwindTheme = {
  colors: Colors
  space: typeof space
  size: typeof size
  fontSize: typeof fontSize
  lineHeight: typeof lineHeight
  fontWeight: typeof fontWeight
  letterSpacing: typeof letterSpacing
  radius: typeof radius
  shadow: typeof shadow
  opacity: typeof opacity
  zIndex: typeof zIndex
  borderWidth: typeof borderWidth
  aspectRatio: typeof aspectRatio
  duration: typeof duration
  easing: typeof easing
}

type ShadeKey = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950

type ColorFamily = Record<ShadeKey, string>

type FamilyName =
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose"
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"

/**
 * Tailwind v4 color palette with all color families and shade levels.
 */
export type Palette = Record<FamilyName, ColorFamily> & {
  white: string
  black: string
  transparent: string
}
