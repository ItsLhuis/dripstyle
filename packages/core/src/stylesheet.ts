import { StyleSheet as RNStyleSheet } from "react-native"

import { assertNotConfiguredAfterMount, setStore, warnIfNotConfigured } from "./store"

import type { StyleConfigureOptions, StyleSheetDefinition, StyleSheetFactory } from "./types"

declare const __DEV__: boolean

/**
 * Primary entry point for configuring themes and creating stylesheets.
 *
 * @example
 * ```ts
 * StyleSheet.configure({
 *   themes: { light: lightTheme, dark: darkTheme },
 *   settings: { adaptiveThemes: true },
 * })
 *
 * const styles = StyleSheet.create(({ theme }) => ({
 *   container: { flex: 1, backgroundColor: theme.colors.background },
 * }))
 * ```
 */
export const StyleSheet = {
  /**
   * Registers themes and global settings. Must be called once at app startup,
   * before `<ThemeProvider>` mounts.
   *
   * @param options - Themes and settings to register.
   */
  configure(options: StyleConfigureOptions): void {
    assertNotConfiguredAfterMount("StyleSheet.configure()")

    const { settings } = options

    if (__DEV__) {
      if (settings?.adaptiveThemes && settings.initialTheme !== undefined) {
        throw new Error(
          "[dripstyle] StyleSheet.configure(): `adaptiveThemes` and `initialTheme` are mutually exclusive. " +
            "Use one or the other, not both."
        )
      }

      if (settings?.adaptiveThemes) {
        if (!options.themes?.light || !options.themes?.dark) {
          throw new Error(
            "[dripstyle] StyleSheet.configure(): `adaptiveThemes: true` requires both `themes.light` " +
              "and `themes.dark` to be registered."
          )
        }
      }
    }

    let activeThemeName: string | null = null

    if (settings?.initialTheme !== undefined) {
      if (typeof settings.initialTheme === "function") {
        const result = settings.initialTheme()

        if (__DEV__ && (result as unknown) instanceof Promise) {
          throw new Error(
            "[dripstyle] StyleSheet.configure(): `initialTheme` must be a synchronous function. " +
              "Async functions are not supported. Resolve the theme name before calling configure()."
          )
        }

        activeThemeName = result
      } else {
        activeThemeName = settings.initialTheme
      }
    }

    setStore({
      registeredThemes: options.themes ?? {},
      breakpoints: options.breakpoints ?? {},
      adaptiveThemes: settings?.adaptiveThemes ?? false,
      activeThemeName,
      isConfigured: true
    })
  },

  /**
   * Creates a stylesheet. Drop-in superset of `RN.StyleSheet.create()`.
   *
   * - **Plain object**: runs through `RN.StyleSheet.create()` immediately for
   *   bridge-optimized numeric IDs. Returned directly by `useStyles()`.
   * - **Factory function**: stored as-is, evaluated lazily at `useStyles()` call
   *   time with the current theme and runtime context.
   *
   * @param definition - A static style record or a factory function.
   * @returns The definition for later consumption by `useStyles()`.
   *
   * @example
   * ```ts
   * // Static — zero overhead, identical to RN.StyleSheet.create()
   * const styles = StyleSheet.create({
   *   container: { flex: 1, backgroundColor: "#fff" },
   * })
   *
   * // Factory — evaluated at useStyles() time
   * const styles = StyleSheet.create(({ theme }) => ({
   *   container: { flex: 1, backgroundColor: theme.colors.background },
   * }))
   * ```
   */
  create<T extends StyleSheetDefinition>(definition: T): StyleSheetFactory<T> {
    if (__DEV__) {
      warnIfNotConfigured("StyleSheet.create()")
    }

    if (typeof definition === "function") {
      return definition as StyleSheetFactory<T>
    }

    return RNStyleSheet.create(
      definition as Record<string, Record<string, unknown>>
    ) as unknown as StyleSheetFactory<T>
  },

  /**
   * Flattens an array of style objects into one aggregated style object.
   *
   * @example
   * ```ts
   * StyleSheet.flatten([styles.listItem, styles.selectedListItem])
   * // returns { flex: 1, fontSize: 16, color: 'green' }
   * ```
   */
  flatten: RNStyleSheet.flatten,

  /**
   * Combines two styles such that `style2` will override any styles in `style1`.
   * If either style is falsy, the other one is returned without allocating
   * an array, saving allocations and maintaining reference equality for
   * PureComponent checks.
   */
  compose: RNStyleSheet.compose,

  /**
   * A very common pattern is to create overlays with position absolute and zero positioning,
   * so `absoluteFill` can be used for convenience and to reduce duplication of these repeated
   * styles.
   */
  absoluteFill: RNStyleSheet.absoluteFill,

  /**
   * This is defined as the width of a thin line on the platform. It can be
   * used as the thickness of a border or division between two elements.
   *
   * This constant will always be a round number of pixels (so a line defined
   * by it looks crisp) and will try to match the standard width of a thin line
   * on the underlying platform. However, you should not rely on it being a
   * constant size, because on different platforms and screen densities its
   * value may be calculated differently.
   */
  hairlineWidth: RNStyleSheet.hairlineWidth
} as const
