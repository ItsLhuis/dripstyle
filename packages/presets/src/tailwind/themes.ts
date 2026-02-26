import { palette } from "./palette"

import * as accessors from "./accessors"

import type { TailwindTheme } from "./types"

/**
 * Pre-built light and dark themes for the Tailwind preset.
 *
 * Both themes share the same accessor function references — `themes.light.space === themes.dark.space`.
 */
export const themes = {
  light: {
    colors: {
      background: palette.white,
      foreground: palette.zinc[950],
      card: palette.white,
      cardForeground: palette.zinc[950],
      popover: palette.white,
      popoverForeground: palette.zinc[950],
      primary: palette.zinc[900],
      primaryForeground: palette.zinc[50],
      secondary: palette.zinc[100],
      secondaryForeground: palette.zinc[900],
      muted: palette.zinc[100],
      mutedForeground: palette.zinc[500],
      accent: palette.zinc[100],
      accentForeground: palette.zinc[900],
      destructive: palette.red[500],
      destructiveForeground: palette.zinc[50],
      border: palette.zinc[200],
      input: palette.zinc[200],
      ring: palette.zinc[400],
      chart1: palette.orange[500],
      chart2: palette.teal[500],
      chart3: palette.blue[700],
      chart4: palette.yellow[300],
      chart5: palette.amber[400],
      tabbar: palette.zinc[50],
      tabbarForeground: palette.zinc[950],
      tabbarPrimary: palette.zinc[900],
      tabbarPrimaryForeground: palette.zinc[50],
      tabbarAccent: palette.zinc[100],
      tabbarAccentForeground: palette.zinc[900],
      tabbarBorder: palette.zinc[200],
      tabbarRing: palette.zinc[400],
      info: palette.sky[500],
      infoForeground: palette.zinc[50],
      infoBorder: palette.sky[200],
      success: palette.green[500],
      successForeground: palette.zinc[50],
      successBorder: palette.green[200],
      warning: palette.amber[500],
      warningForeground: palette.zinc[50],
      warningBorder: palette.amber[200],
      error: palette.red[500],
      errorForeground: palette.zinc[50],
      errorBorder: palette.red[200]
    },
    ...accessors
  },
  dark: {
    colors: {
      background: palette.zinc[950],
      foreground: palette.zinc[50],
      card: palette.zinc[900],
      cardForeground: palette.zinc[50],
      popover: palette.zinc[900],
      popoverForeground: palette.zinc[50],
      primary: palette.zinc[200],
      primaryForeground: palette.zinc[900],
      secondary: palette.zinc[800],
      secondaryForeground: palette.zinc[50],
      muted: palette.zinc[800],
      mutedForeground: palette.zinc[400],
      accent: palette.zinc[800],
      accentForeground: palette.zinc[50],
      destructive: palette.red[500],
      destructiveForeground: palette.zinc[50],
      border: palette.zinc[800],
      input: palette.zinc[800],
      ring: palette.zinc[500],
      chart1: palette.indigo[500],
      chart2: palette.emerald[400],
      chart3: palette.amber[400],
      chart4: palette.violet[500],
      chart5: palette.rose[500],
      tabbar: palette.zinc[900],
      tabbarForeground: palette.zinc[50],
      tabbarPrimary: palette.indigo[500],
      tabbarPrimaryForeground: palette.zinc[50],
      tabbarAccent: palette.zinc[800],
      tabbarAccentForeground: palette.zinc[50],
      tabbarBorder: palette.zinc[800],
      tabbarRing: palette.zinc[500],
      info: palette.sky[500],
      infoForeground: palette.zinc[50],
      infoBorder: palette.sky[800],
      success: palette.green[500],
      successForeground: palette.zinc[50],
      successBorder: palette.green[800],
      warning: palette.amber[500],
      warningForeground: palette.zinc[50],
      warningBorder: palette.amber[800],
      error: palette.red[500],
      errorForeground: palette.zinc[50],
      errorBorder: palette.red[800]
    },
    ...accessors
  }
} as const satisfies { light: TailwindTheme; dark: TailwindTheme }
