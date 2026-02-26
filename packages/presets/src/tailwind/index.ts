import { palette } from "./palette"
import { themes } from "./themes"
import { breakpointTokens } from "./tokens"

export type { Colors, Palette, TailwindTheme } from "./types"

/**
 * The Tailwind preset for @dripstyle/core.
 *
 * @example
 * import { preset } from '@dripstyle/presets/tailwind';
 *
 * StyleSheet.configure({
 *   themes: preset.themes,
 *   breakpoints: preset.breakpoints,
 * });
 *
 * type AppThemes = typeof preset.themes
 * type AppBreakpoints = typeof preset.breakpoints
 *
 * declare module "@dripstyle/core" {
 *   export interface DripstyleThemes extends AppThemes {}
 *   export interface DripstyleBreakpoints extends AppBreakpoints {}
 * }
 */
export const preset = {
  themes,
  breakpoints: breakpointTokens
} as const

export { palette }
