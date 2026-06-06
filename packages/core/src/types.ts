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

type ResolvedThemes = [keyof DripstyleThemes] extends [never]
  ? Record<string, unknown>
  : DripstyleThemes

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

/**
 * Extracts the union of all style value types from a VariantsConfig.
 * Used to infer the specific return style type of a variant function.
 */
export type VariantStyleType<V extends VariantsConfig> = {
  [K in keyof V]: V[K][keyof V[K] & string]
}[keyof V]

/** Callable function returned by `createVariant()` that resolves variant props to a style object. */
export type VariantFunction<
  V extends VariantsConfig,
  D extends DefaultVariants<V>,
  S extends ViewStyle | TextStyle | ImageStyle = ViewStyle | TextStyle | ImageStyle
> = (props?: VariantProps<V, D>) => S

/** A `VariantFunction` branded with `VARIANT_MARKER` so the processing pipeline can identify it. */
export type MarkedVariantFunction<
  V extends VariantsConfig,
  D extends DefaultVariants<V>,
  S extends ViewStyle | TextStyle | ImageStyle = ViewStyle | TextStyle | ImageStyle
> = VariantFunction<V, D, S> & { [VARIANT_MARKER]: true }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SafeReturnType<T> = T extends (...args: any[]) => infer R ? R : T

type ExtractVariantKeys<T> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<infer K, any> ? (K extends "true" | "false" ? boolean : K) : never

type ExtractStyleVariants<T> = T extends { config: VariantConfig<infer V> }
  ? { [K in keyof V]?: ExtractVariantKeys<V[K]> | undefined }
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends MarkedVariantFunction<infer V, any, any>
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
      Style extends MarkedVariantFunction<infer V, any, any>
      ? D extends keyof V
        ? keyof V[D]
        : never
      : never
    : never

/**
 * Resolves the processed type of a single style sheet entry.
 *
 * - `MarkedVariantFunction` → passed through as-is (callable with variant props)
 * - Any other function → passed through with its full call signature preserved, so an
 *   inline style such as `card: (selected: boolean) => ({ ... })` stays callable as
 *   `styles.card(selected)`. `theme`/`runtime` are closed over from the factory.
 * - Static object → preserves the specific style type `T`
 */
export type ProcessedStyle<T> =
  T extends MarkedVariantFunction<infer V, infer D, infer S>
    ? MarkedVariantFunction<V, D, S>
    : T extends (...args: infer A) => infer S
      ? (...args: A) => ProcessedStaticStyle<S>
      : ProcessedStaticStyle<T>

type StyleValue = ViewStyle | TextStyle | ImageStyle

type StylePropertyValue<K extends PropertyKey> = K extends keyof ViewStyle
  ? ViewStyle[K]
  : K extends keyof TextStyle
    ? TextStyle[K]
    : K extends keyof ImageStyle
      ? ImageStyle[K]
      : never

/**
 * Every `ViewStyle`, `TextStyle`, and `ImageStyle` property flattened into one object type, each key
 * keeping its value type. Used as the per-entry contextual type because property checks are reliable
 * against a single object, unlike a `ViewStyle | TextStyle | ImageStyle` union.
 */
type FlatStyle = {
  [K in keyof ViewStyle | keyof TextStyle | keyof ImageStyle]?: StylePropertyValue<K>
}

type ProcessedStaticStyle<T> = [T] extends [StyleValue]
  ? T
  : T extends object
    ? { [K in keyof T]: StylePropertyValue<K> }
    : T

/** A callable style entry — an inline style function or a `createVariant()` result. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StyleSheetFunctionEntry = (...args: any[]) => FlatStyle

/**
 * A single stylesheet entry: a static style object, an inline style function, or a `createVariant()`
 * result. As the per-key constraint for `StyleSheet.create()` it contextually types every entry, so
 * entries get autocomplete and keep their literal values while still being inferred concretely for
 * `useStyles()`. See the constraint note in `stylesheet.ts`.
 */
type StyleSheetEntry = FlatStyle | StyleSheetFunctionEntry

/** A static RN style record accepted by `StyleSheet.create()`. */
export type StaticStyleSheetDefinition = Record<string, StyleSheetEntry>

/** The object returned from a stylesheet factory. Structurally identical to a static definition. */
export type StyleSheetFactoryResult = Record<string, StyleSheetEntry>

/**
 * A style sheet definition: either a static record of RN styles,
 * or a factory function that receives `StyleSheetContext`.
 *
 * Inside the factory, an entry may be:
 *
 * - a static style object,
 * - a `createVariant()` result (callable with variant props), or
 * - an inline function with arbitrary user-defined arguments that returns a style object.
 *   The result is validated as a React Native style while preserving the function's concrete
 *   return type through `useStyles()`:
 *
 * ```ts
 * StyleSheet.create(({ theme, runtime }) => ({
 *   row: { flexDirection: "row" },
 *   card: (selected: boolean) => ({
 *     borderColor: selected ? theme.colors.primary : "transparent"
 *   })
 * }))
 * ```
 */
export type StyleSheetDefinition =
  | StaticStyleSheetDefinition
  | ((ctx: StyleSheetContext) => StyleSheetFactoryResult)

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
    ? { [K in keyof T]: ProcessedStyle<T[K]> }
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
