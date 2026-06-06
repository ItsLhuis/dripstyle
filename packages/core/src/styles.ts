import type { ImageStyle, TextStyle, ViewStyle } from "react-native"

/**
 * Optional identity helper that contextually types its argument as a `ViewStyle`.
 *
 * Inline function styles already validate their properties and preserve their call signature
 * **without any wrapper**. Reach for `viewStyle()` only when you want full autocomplete and
 * property-pinpointed errors *inside* the returned object: TypeScript cannot contextually type the
 * body of a bare inline function whose stylesheet entry may also be an object or a variant, so the
 * wrapper opts into that. It returns its argument untouched and captures the literal style type.
 *
 * @example
 * ```ts
 * StyleSheet.create(({ theme }) => ({
 *   card: (selected: boolean) =>
 *     viewStyle({
 *       borderColor: selected ? theme.colors.primary : "transparent",
 *       borderWidth: theme.borderWidth("md")
 *     })
 * }))
 * ```
 */
export function viewStyle<T extends ViewStyle>(style: T): T {
  return style
}

/**
 * Optional identity helper that contextually types its argument as a `TextStyle`.
 *
 * See {@link viewStyle} — same behavior, for text styles.
 */
export function textStyle<T extends TextStyle>(style: T): T {
  return style
}

/**
 * Optional identity helper that contextually types its argument as an `ImageStyle`.
 *
 * See {@link viewStyle} — same behavior, for image styles.
 */
export function imageStyle<T extends ImageStyle>(style: T): T {
  return style
}
