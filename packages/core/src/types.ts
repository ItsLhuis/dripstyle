import type { ImageStyle, TextStyle, ViewStyle } from "react-native"

/**
 * Module augmentation interface for registering custom themes.
 *
 * Extend this interface with your theme map to enable full type inference
 * for theme names and values across all dripstyle core APIs.
 *
 * @example
 * ```ts
 * type AppThemes = typeof myThemes
 *
 * declare module "@dripstyle/core" {
 *   export interface DripstyleThemes extends AppThemes {}
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DripstyleThemes {}

/**
 * Module augmentation interface for registering custom breakpoints.
 *
 * Extend this interface with your breakpoint map to enable full type inference
 * for breakpoint names across all dripstyle core APIs.
 *
 * @example
 * ```ts
 * type AppBreakpoints = typeof myBreakpoints
 *
 * declare module "@dripstyle/core" {
 *   export interface DripstyleBreakpoints extends AppBreakpoints {}
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DripstyleBreakpoints {}

type ResolvedThemes = [keyof DripstyleThemes] extends [never] ? Record<string, unknown> : DripstyleThemes

/** Union of all registered theme names, inferred from {@link DripstyleThemes}. */
export type ThemeName = keyof ResolvedThemes & string

/** The resolved theme type, inferred from {@link DripstyleThemes}. */
export type Theme = ResolvedThemes[ThemeName]

type ResolvedBreakpoints = [keyof DripstyleBreakpoints] extends [never]
  ? Record<string, number>
  : DripstyleBreakpoints

/** Union of all registered breakpoint names, inferred from {@link DripstyleBreakpoints}. */
export type BreakpointName = keyof ResolvedBreakpoints & string

/**
 * Runtime environment data available inside style factories.
 */
export type RuntimeValues = {
  window: { width: number; height: number; scale: number; fontScale: number }
  screen: { width: number; height: number; scale: number; fontScale: number }
  insets: { top: number; right: number; bottom: number; left: number }
  statusBar: { height: number }
  navigationBar: { height: number }
  orientation: "portrait" | "landscape"
  isPortrait: boolean
  isLandscape: boolean
  breakpoint: BreakpointName
  breakpoints: Record<BreakpointName, number>
  pixelRatio: number
  fontScale: number
  platform: "ios" | "android" | "web" | "macos" | "windows"
  colorScheme: "light" | "dark" | null
  /** iOS content size category for accessibility font sizing. Null on other platforms. */
  contentSizeCategory: string | null
  isRTL: boolean
  reduceMotion: boolean
}

/**
 * The object passed to every style factory function.
 *
 * @example
 * ```ts
 * StyleSheet.create(({ theme, runtime }) => ({
 *   container: { padding: theme.space('md') }
 * }))
 * ```
 */
export type StyleSheetContext = {
  theme: Theme
  runtime: RuntimeValues
}

/**
 * Symbol used to mark variant functions so the processing pipeline can
 * distinguish them from regular style functions.
 */
export const VARIANT_MARKER = Symbol("dripstyle.variant")

/**
 * A record of variant dimensions, each mapping option keys to RN style objects.
 *
 * @example
 * ```ts
 * type ButtonVariants = {
 *   size: { sm: ViewStyle; md: ViewStyle; lg: ViewStyle }
 *   intent: { primary: ViewStyle; ghost: ViewStyle }
 * }
 * ```
 */
export type VariantsConfig = Record<string, Record<string, ViewStyle | TextStyle | ImageStyle>>

/** Maps each variant dimension to an optional default option key. */
export type DefaultVariants<V extends VariantsConfig> = {
  [K in keyof V]?: keyof V[K] extends "true" | "false" ? boolean : keyof V[K] & string
}

/** Applies additional styles when ALL specified conditions match. */
export type CompoundVariant<V extends VariantsConfig> = {
  [K in keyof V]?: keyof V[K]
} & { style: ViewStyle | TextStyle | ImageStyle }

/** Full configuration object accepted by `createVariant()`. */
export type VariantConfig<V extends VariantsConfig> = {
  base?: ViewStyle | TextStyle | ImageStyle
  variants: V
  defaultVariants?: DefaultVariants<V>
  compoundVariants?: CompoundVariant<V>[]
}

/**
 * Prop type for a variant function.
 *
 * Boolean variant dimensions (where all option keys are `"true"` | `"false"`)
 * are exposed as TypeScript `boolean`: `disabled={true}` instead of `disabled="true"`.
 */
export type VariantProps<V extends VariantsConfig, _D extends DefaultVariants<V>> = {
  [K in keyof V]?: keyof V[K] extends "true" | "false" ? boolean : keyof V[K]
}

/** Callable function returned by `createVariant()` that resolves variant props to a style object. */
export type VariantFunction<V extends VariantsConfig, D extends DefaultVariants<V>> = (
  props?: VariantProps<V, D>
) => ViewStyle | TextStyle | ImageStyle

/** A `VariantFunction` branded with `VARIANT_MARKER` so the processing pipeline can identify it. */
export type MarkedVariantFunction<
  V extends VariantsConfig,
  D extends DefaultVariants<V>,
> = VariantFunction<V, D> & { [VARIANT_MARKER]: true }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SafeReturnType<T> = T extends (...args: any[]) => infer R ? R : T

type ExtractVariantKeys<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<infer K, any> ? (K extends "true" | "false" ? boolean : K) : never

type ExtractStyleVariants<T> = T extends { config: VariantConfig<infer V> }
  ? { [K in keyof V]?: ExtractVariantKeys<V[K]> | undefined }
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends MarkedVariantFunction<infer V, any>
    ? { [K in keyof V]?: ExtractVariantKeys<V[K]> | undefined }
    : never

/**
 * Extracts variant prop types from a specific style key in a stylesheet factory.
 *
 * @example
 * ```ts
 * type ButtonVariants = StyleVariants<typeof stylesheet, "button">
 * // → { size?: "sm" | "md" | "lg"; disabled?: boolean }
 * ```
 */
export type StyleVariants<T, K extends keyof SafeReturnType<T>> = ExtractStyleVariants<
  SafeReturnType<T>[K]
>

/**
 * Extracts the value union for a single variant dimension within a stylesheet style key.
 *
 * @example
 * ```ts
 * type SizeValues = ExtractVariantValues<typeof stylesheet, "button", "size">
 * // → "sm" | "md" | "lg"
 * ```
 */
export type ExtractVariantValues<T, K extends string, D extends string> =
  SafeReturnType<T> extends Record<K, infer Style>
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Style extends MarkedVariantFunction<infer V, any>
      ? D extends keyof V
        ? keyof V[D]
        : never
      : never
    : never

/**
 * Resolves the processed type of a single style sheet entry.
 *
 * - `MarkedVariantFunction` → passed through as-is (callable with variant props)
 * - Dynamic function → returns `ViewStyle | TextStyle | ImageStyle`
 * - Static object → `ViewStyle | TextStyle | ImageStyle`
 */
export type ProcessedStyle<T> =
  T extends MarkedVariantFunction<infer V, infer D>
    ? MarkedVariantFunction<V, D>
    : T extends (ctx: StyleSheetContext) => infer _S
      ? ViewStyle | TextStyle | ImageStyle
      : ViewStyle | TextStyle | ImageStyle

/**
 * A style sheet definition: either a static record of RN styles,
 * or a factory function that receives `StyleSheetContext`.
 */
export type StyleSheetDefinition =
  | Record<string, ViewStyle | TextStyle | ImageStyle>
  | ((
      ctx: StyleSheetContext
    ) => Record<
      string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ViewStyle | TextStyle | ImageStyle | MarkedVariantFunction<any, any>
    >)

/** Identity wrapper that preserves the literal type of a style sheet definition for inference. */
export type StyleSheetFactory<T extends StyleSheetDefinition> = T

/**
 * The fully-processed stylesheet returned by `useStyles()`.
 * Each key resolves to a static style or a callable variant function.
 */
export type ProcessedStyleSheet<T extends StyleSheetDefinition> = T extends (
  ctx: StyleSheetContext
) => infer R
  ? { [K in keyof R]: ProcessedStyle<R[K]> }
  : T extends Record<string, unknown>
    ? { [K in keyof T]: ViewStyle | TextStyle | ImageStyle }
    : never

/**
 * Options accepted by `StyleSheet.configure()`.
 *
 * Call once at app startup, before any React rendering, to register
 * your themes and global settings.
 *
 * @example
 * ```ts
 * StyleSheet.configure({
 *   themes: { light: lightTheme, dark: darkTheme },
 *   settings: { adaptiveThemes: true },
 * })
 * ```
 */
export type StyleConfigureOptions = {
  themes?: Record<string, unknown>
  breakpoints?: Record<string, number>
  settings?: {
    /**
     * Initial theme name or synchronous resolver.
     * Mutually exclusive with `adaptiveThemes`.
     */
    initialTheme?: string | (() => string)
    /**
     * Auto-switches between `themes.light` and `themes.dark` based on
     * system color scheme. Requires both to be registered.
     * Mutually exclusive with `initialTheme`.
     */
    adaptiveThemes?: boolean
  }
}
