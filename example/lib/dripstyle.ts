import { StyleSheet } from "@dripstyle/core"

import { preset } from "@dripstyle/presets/tailwind"

StyleSheet.configure({
  themes: preset.themes,
  breakpoints: preset.breakpoints,
  settings: { adaptiveThemes: true }
})

type AppThemes = typeof preset.themes
type AppBreakpoints = typeof preset.breakpoints

declare module "@dripstyle/core" {
  export interface DripstyleThemes extends AppThemes {}
  export interface DripstyleBreakpoints extends AppBreakpoints {}
}
