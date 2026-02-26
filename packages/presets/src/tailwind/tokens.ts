type ShadowProps = {
  shadowColor: string
  shadowOffset: { width: number; height: number }
  shadowOpacity: number
  shadowRadius: number
  elevation: number
}

/**
 * Defines standard spacing values based on a 4px base unit.
 */
export const spacingTokens = {
  px: 1,
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384
} as const

/**
 * Type alias for spacing tokens.
 */
export type SpacingAlias = keyof typeof spacingTokens

/**
 * Defines standard size values, extending spacing with special layout values.
 */
export const sizeTokens = {
  ...spacingTokens,
  auto: "auto" as const,
  full: "100%" as const,
} as const

/**
 * Type alias for size tokens.
 */
export type SizeAlias = keyof typeof sizeTokens

/**
 * Defines standard font size values.
 */
export const fontSizeTokens = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
  "6xl": 60,
  "7xl": 72,
  "8xl": 96,
  "9xl": 128
} as const

/**
 * Type alias for font size tokens.
 */
export type FontSizeAlias = keyof typeof fontSizeTokens

/**
 * Defines standard font weight values.
 */
export const fontWeightTokens = {
  thin: "100",
  extralight: "200",
  light: "300",
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900"
} as const

/**
 * Type alias for font weight tokens.
 */
export type FontWeightAlias = keyof typeof fontWeightTokens

/**
 * Defines standard line height values. Named keys are unitless multipliers;
 * numeric keys are absolute pixel values for React Native.
 */
export const lineHeightTokens = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40
} as const

/**
 * Type alias for line height tokens.
 */
export type LineHeightAlias = keyof typeof lineHeightTokens

/**
 * Defines standard letter spacing values in points.
 */
export const letterSpacingTokens = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.6
} as const

/**
 * Type alias for letter spacing tokens.
 */
export type LetterSpacingAlias = keyof typeof letterSpacingTokens

/**
 * Defines standard border radius values.
 */
export const borderRadiusTokens = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
  "3xl": 24,
  full: 9999
} as const

/**
 * Type alias for border radius tokens.
 */
export type BorderRadiusAlias = keyof typeof borderRadiusTokens

/**
 * Defines standard border width values.
 */
export const borderWidthTokens = {
  none: 0,
  sm: 0.5,
  base: 1,
  md: 2,
  lg: 4,
  xl: 8
} as const

/**
 * Type alias for border width tokens.
 */
export type BorderWidthAlias = keyof typeof borderWidthTokens

/**
 * Defines standard shadow tokens for consistent elevation and depth.
 */
export const shadowTokens: Record<string, ShadowProps> = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0
  },
  "2xs": {
    shadowColor: "rgb(0, 0, 0)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1
  },
  xs: {
    shadowColor: "rgb(0, 0, 0)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  sm: {
    shadowColor: "rgb(0, 0, 0)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3
  },
  md: {
    shadowColor: "rgb(0, 0, 0)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5
  },
  lg: {
    shadowColor: "rgb(0, 0, 0)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8
  },
  xl: {
    shadowColor: "rgb(0, 0, 0)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 12
  },
  "2xl": {
    shadowColor: "rgb(0, 0, 0)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16
  }
} as const

/**
 * Type alias for shadow tokens.
 */
export type ShadowAlias = keyof typeof shadowTokens

/**
 * Defines standard opacity values.
 */
export const opacityTokens = {
  0: 0,
  5: 0.05,
  10: 0.1,
  15: 0.15,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  35: 0.35,
  40: 0.4,
  45: 0.45,
  50: 0.5,
  55: 0.55,
  60: 0.6,
  65: 0.65,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  85: 0.85,
  90: 0.9,
  95: 0.95,
  100: 1
} as const

/**
 * Type alias for opacity tokens.
 */
export type OpacityAlias = keyof typeof opacityTokens

/**
 * Defines standard z-index tokens for layering UI elements.
 */
export const zIndexTokens = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070
} as const

/**
 * Type alias for z-index tokens.
 */
export type ZIndexAlias = keyof typeof zIndexTokens

/**
 * Defines responsive breakpoint thresholds in pixels.
 */
export const breakpointTokens = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
} as const

/**
 * Type alias for breakpoint tokens.
 */
export type BreakpointAlias = keyof typeof breakpointTokens

/**
 * Defines standard aspect ratio values.
 */
export const aspectRatioTokens = {
  square: 1,
  video: 16 / 9,
  portrait: 3 / 4,
  wide: 21 / 9,
  ultrawide: 32 / 9,
  golden: 1.618
} as const

/**
 * Type alias for aspect ratio tokens.
 */
export type AspectRatioAlias = keyof typeof aspectRatioTokens

/**
 * Defines standard animation duration values in milliseconds.
 */
export const durationTokens = {
  0: 0,
  75: 75,
  100: 100,
  150: 150,
  200: 200,
  300: 300,
  500: 500,
  700: 700,
  1000: 1000
} as const

/**
 * Type alias for animation duration tokens.
 */
export type DurationAlias = keyof typeof durationTokens

/**
 * Defines standard animation easing functions as cubic-bezier control point arrays.
 */
export const easingTokens = {
  linear: [0, 0, 1, 1] as [number, number, number, number],
  in: [0.4, 0, 1, 1] as [number, number, number, number],
  out: [0, 0, 0.2, 1] as [number, number, number, number],
  inOut: [0.4, 0, 0.2, 1] as [number, number, number, number]
} as const

/**
 * Type alias for animation easing tokens.
 */
export type EasingAlias = keyof typeof easingTokens
