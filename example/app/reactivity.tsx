import { memo, useRef, useState, type ReactElement, type ReactNode } from "react"

import {
  Pressable,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle
} from "react-native"

import { createVariant, StyleSheet, useRuntime, useStyles, useTheme } from "@dripstyle/core"

/**
 * Reactivity test screen.
 *
 * Each probe card re-renders ONLY when the specific theme/runtime value its stylesheet reads
 * changes. Watch the per-card render counters: switching the theme bumps only the theme-dependent
 * cards; resizing the window bumps only the dimensions card; the static card never moves. The root
 * component holds no reactive hooks and every probe is `memo`'d, so a probe can only re-render via
 * its own `useStyles` subscription — that isolation is what makes the demonstration trustworthy.
 */

function useRenderCount(): number {
  const countRef = useRef(0)

  // Intentional dev-only render counter. Reading and writing the ref during render is what lets a
  // card display how many times it actually re-rendered — that count is the whole point of this
  // screen. The value is display-only and never feeds back into rendering logic.
  // eslint-disable-next-line react-hooks/refs
  countRef.current += 1

  // eslint-disable-next-line react-hooks/refs
  return countRef.current
}

function clampBarWidth(width: number): number {
  return Math.max(24, Math.min(width / 6, 220))
}

const layout = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  scroll: { flex: 1 },
  content: { padding: 14 },
  inner: { gap: 12 },
  grid: { gap: 10 }
})

// Static, theme-independent chrome shared by every probe whose dependency is NOT the theme. Because
// it never reads the theme, these cards keep their fixed colors when you switch themes — a visible
// signal that they did not re-render.
const chrome = StyleSheet.create({
  card: {
    backgroundColor: "#f4f4f5",
    borderColor: "#d4d4d8",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 4
  },
  title: { fontSize: 15, fontWeight: "700", color: "#18181b" },
  meta: { fontSize: 12, color: "#52525b" },
  count: { fontSize: 24, fontWeight: "800", color: "#4f46e5", marginTop: 6 }
})

const backdropSheet = StyleSheet.create(({ theme }) => ({
  fill: { backgroundColor: theme.colors.background }
}))

const controlsSheet = StyleSheet.create(({ theme }) => ({
  panel: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10
  },
  heading: { fontSize: 18, fontWeight: "800", color: theme.colors.foreground },
  intro: { fontSize: 13, color: theme.colors.mutedForeground, lineHeight: 18 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  state: { fontSize: 13, color: theme.colors.foreground, fontWeight: "600" },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8
  },
  primaryButtonText: { color: theme.colors.primaryForeground, fontWeight: "700", fontSize: 13 },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8
  },
  secondaryButtonText: { color: theme.colors.secondaryForeground, fontWeight: "700", fontSize: 13 },
  panelCount: { fontSize: 12, color: theme.colors.mutedForeground }
}))

const dashboardSheet = StyleSheet.create(({ theme }) => ({
  panel: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 6
  },
  heading: { fontSize: 15, fontWeight: "700", color: theme.colors.foreground },
  hint: { fontSize: 12, color: theme.colors.mutedForeground },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 13, color: theme.colors.mutedForeground },
  value: { fontSize: 13, fontWeight: "700", color: theme.colors.foreground },
  count: { fontSize: 13, fontWeight: "800", color: theme.colors.primary, marginTop: 4 }
}))

const themeProbeSheet = StyleSheet.create(({ theme }) => ({
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 4
  },
  title: { fontSize: 15, fontWeight: "700", color: theme.colors.foreground },
  meta: { fontSize: 12, color: theme.colors.mutedForeground },
  count: { fontSize: 24, fontWeight: "800", color: theme.colors.primary, marginTop: 6 },
  swatch: { width: 32, height: 32, borderRadius: 8, backgroundColor: theme.colors.primary }
}))

const themeAndDimensionsSheet = StyleSheet.create(({ theme, runtime }) => ({
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 4
  },
  title: { fontSize: 15, fontWeight: "700", color: theme.colors.foreground },
  meta: { fontSize: 12, color: theme.colors.mutedForeground },
  count: { fontSize: 24, fontWeight: "800", color: theme.colors.primary, marginTop: 6 },
  bar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    width: clampBarWidth(runtime.window.width)
  }
}))

const dimensionsSheet = StyleSheet.create(({ runtime }) => ({
  bar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6366f1",
    width: clampBarWidth(runtime.window.width)
  }
}))

const insetsSheet = StyleSheet.create(({ runtime }) => ({
  bar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#14b8a6",
    width: 48 + runtime.insets.top + runtime.insets.bottom
  },
  // Carries the live inset values out of the factory so the probe can show them WITHOUT calling
  // useRuntime() (which would subscribe to every runtime key and break the "insets only" isolation).
  // borderWidths are plain numbers, so they read back cleanly; the style is never applied to a View.
  value: {
    borderTopWidth: runtime.insets.top,
    borderBottomWidth: runtime.insets.bottom
  }
}))

const colorSchemeSheet = StyleSheet.create(({ runtime }) => ({
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: runtime.colorScheme === "dark" ? "#0ea5e9" : "#f59e0b"
  }
}))

const reduceMotionSheet = StyleSheet.create(({ runtime }) => ({
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: runtime.reduceMotion ? "#22c55e" : "#ef4444"
  }
}))

const inlineThemeSheet = StyleSheet.create(({ theme }) => ({
  swatch: () => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.primary
  })
}))

const variantThemeSheet = StyleSheet.create(({ theme }) => ({
  badge: createVariant({
    base: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999
    },
    variants: { tone: { solid: {}, soft: { opacity: 0.6 } } },
    defaultVariants: { tone: "solid" }
  })
}))

type ProbeFrameProps = {
  index: number
  title: string
  reads: string
  note: string
  renders: number
  cardStyle: StyleProp<ViewStyle>
  titleStyle: StyleProp<TextStyle>
  metaStyle: StyleProp<TextStyle>
  countStyle: StyleProp<TextStyle>
  children?: ReactNode
}

function ProbeFrame(props: ProbeFrameProps): ReactElement {
  return (
    <View style={props.cardStyle}>
      <Text style={props.titleStyle}>
        {props.index} · {props.title}
      </Text>
      <Text style={props.metaStyle}>reads: {props.reads}</Text>
      <Text style={props.metaStyle}>{props.note}</Text>
      {props.children}
      <Text style={props.countStyle}>renders: {props.renders}</Text>
    </View>
  )
}

const StaticProbe = memo(function StaticProbe(): ReactElement {
  const styles = useStyles(chrome)

  const renders = useRenderCount()

  return (
    <ProbeFrame
      index={1}
      title="Static stylesheet"
      reads="— plain object"
      note="Never re-renders on theme or runtime changes"
      renders={renders}
      cardStyle={styles.card}
      titleStyle={styles.title}
      metaStyle={styles.meta}
      countStyle={styles.count}
    />
  )
})

const ThemeProbe = memo(function ThemeProbe(): ReactElement {
  const styles = useStyles(themeProbeSheet)

  const renders = useRenderCount()

  return (
    <ProbeFrame
      index={2}
      title="Theme factory"
      reads="theme.colors"
      note="Re-renders on theme switch only"
      renders={renders}
      cardStyle={styles.card}
      titleStyle={styles.title}
      metaStyle={styles.meta}
      countStyle={styles.count}
    >
      <View style={styles.swatch} />
    </ProbeFrame>
  )
})

const DimensionsProbe = memo(function DimensionsProbe(): ReactElement {
  const styles = useStyles(dimensionsSheet)

  const renders = useRenderCount()

  return (
    <ProbeFrame
      index={3}
      title="Dimensions factory"
      reads="runtime.window.width"
      note="Re-renders on resize / rotate only"
      renders={renders}
      cardStyle={chrome.card}
      titleStyle={chrome.title}
      metaStyle={chrome.meta}
      countStyle={chrome.count}
    >
      <View style={styles.bar} />
    </ProbeFrame>
  )
})

const InsetsProbe = memo(function InsetsProbe(): ReactElement {
  const styles = useStyles(insetsSheet)

  const renders = useRenderCount()

  return (
    <ProbeFrame
      index={4}
      title="Insets factory"
      reads="runtime.insets"
      note="Re-renders only when safe-area insets change — i.e. rotating a device that has a notch / home indicator. On web or a device without a notch, rotation changes dimensions but NOT insets, so this card correctly stays frozen."
      renders={renders}
      cardStyle={chrome.card}
      titleStyle={chrome.title}
      metaStyle={chrome.meta}
      countStyle={chrome.count}
    >
      <Text style={chrome.meta}>
        top {String(styles.value.borderTopWidth)} · bottom {String(styles.value.borderBottomWidth)}
      </Text>
      <View style={styles.bar} />
    </ProbeFrame>
  )
})

const ColorSchemeProbe = memo(function ColorSchemeProbe(): ReactElement {
  const styles = useStyles(colorSchemeSheet)

  const renders = useRenderCount()

  return (
    <ProbeFrame
      index={5}
      title="Color-scheme factory"
      reads="runtime.colorScheme"
      note="Re-renders on OS light/dark change only (adaptive off)"
      renders={renders}
      cardStyle={chrome.card}
      titleStyle={chrome.title}
      metaStyle={chrome.meta}
      countStyle={chrome.count}
    >
      <View style={styles.dot} />
    </ProbeFrame>
  )
})

const ReduceMotionProbe = memo(function ReduceMotionProbe(): ReactElement {
  const styles = useStyles(reduceMotionSheet)

  const renders = useRenderCount()

  return (
    <ProbeFrame
      index={6}
      title="Reduce-motion factory"
      reads="runtime.reduceMotion"
      note="Re-renders on OS reduce-motion toggle only"
      renders={renders}
      cardStyle={chrome.card}
      titleStyle={chrome.title}
      metaStyle={chrome.meta}
      countStyle={chrome.count}
    >
      <View style={styles.dot} />
    </ProbeFrame>
  )
})

const InlineThemeProbe = memo(function InlineThemeProbe(): ReactElement {
  const styles = useStyles(inlineThemeSheet)

  const renders = useRenderCount()

  return (
    <ProbeFrame
      index={7}
      title="Inline-function theme"
      reads="theme inside an inline style fn"
      note="Re-renders on theme switch — static frame, only the swatch is themed (proves inline capture)"
      renders={renders}
      cardStyle={chrome.card}
      titleStyle={chrome.title}
      metaStyle={chrome.meta}
      countStyle={chrome.count}
    >
      <View style={styles.swatch()} />
    </ProbeFrame>
  )
})

const VariantThemeProbe = memo(function VariantThemeProbe(): ReactElement {
  const styles = useStyles(variantThemeSheet)

  const renders = useRenderCount()

  return (
    <ProbeFrame
      index={8}
      title="createVariant theme"
      reads="theme inside a variant config"
      note="Re-renders on theme switch — variant config captured the theme eagerly"
      renders={renders}
      cardStyle={chrome.card}
      titleStyle={chrome.title}
      metaStyle={chrome.meta}
      countStyle={chrome.count}
    >
      <View style={styles.badge({ tone: "solid" })} />
    </ProbeFrame>
  )
})

const ThemeAndDimensionsProbe = memo(function ThemeAndDimensionsProbe(): ReactElement {
  const styles = useStyles(themeAndDimensionsSheet)

  const renders = useRenderCount()

  return (
    <ProbeFrame
      index={9}
      title="Theme + dimensions factory"
      reads="theme.colors + runtime.window.width"
      note="Re-renders on theme switch OR resize"
      renders={renders}
      cardStyle={styles.card}
      titleStyle={styles.title}
      metaStyle={styles.meta}
      countStyle={styles.count}
    >
      <View style={styles.bar} />
    </ProbeFrame>
  )
})

function Backdrop(): ReactElement {
  const styles = useStyles(backdropSheet)

  return <View style={[layout.backdrop, styles.fill]} />
}

function Controls({ onReset }: { onReset: () => void }): ReactElement {
  const { themeName, hasAdaptiveThemes, setTheme, setAdaptiveThemes } = useTheme()

  const styles = useStyles(controlsSheet)

  const renders = useRenderCount()

  const handleSwitchTheme = () => {
    if (hasAdaptiveThemes) {
      setAdaptiveThemes(false)
    }

    setTheme(themeName === "dark" ? "light" : "dark")
  }

  const handleToggleAdaptive = () => {
    setAdaptiveThemes(!hasAdaptiveThemes)
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Selective re-rendering</Text>
      <Text style={styles.intro}>
        Tap “Switch theme” and watch the counters: only theme-dependent cards (2, 7, 8, 9) move. The
        static card (1) never moves; dimensions / insets / color-scheme / reduce-motion cards move
        only when that exact value changes (resize the window, rotate, or change OS settings).
      </Text>
      <View style={styles.row}>
        <Text style={styles.state}>theme: {themeName}</Text>
        <Text style={styles.state}>adaptive: {hasAdaptiveThemes ? "on" : "off"}</Text>
      </View>
      <View style={styles.row}>
        <Pressable style={styles.primaryButton} onPress={handleSwitchTheme}>
          <Text style={styles.primaryButtonText}>Switch theme</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={handleToggleAdaptive}>
          <Text style={styles.secondaryButtonText}>
            {hasAdaptiveThemes ? "Disable adaptive" : "Enable adaptive"}
          </Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onReset}>
          <Text style={styles.secondaryButtonText}>Reset counters</Text>
        </Pressable>
      </View>
      <Text style={styles.panelCount}>this panel (useTheme) renders: {renders}</Text>
    </View>
  )
}

function RuntimeReadout(): ReactElement {
  const runtime = useRuntime()

  const styles = useStyles(dashboardSheet)

  const renders = useRenderCount()

  const rows: [string, string][] = [
    ["window", `${Math.round(runtime.window.width)} × ${Math.round(runtime.window.height)}`],
    ["orientation", runtime.orientation],
    ["breakpoint", runtime.breakpoint],
    ["insets (T/B)", `${runtime.insets.top} / ${runtime.insets.bottom}`],
    ["colorScheme", runtime.colorScheme ?? "null"],
    ["reduceMotion", runtime.reduceMotion ? "yes" : "no"],
    ["pixelRatio", String(runtime.pixelRatio)],
    ["platform", runtime.platform]
  ]

  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Live runtime (useRuntime)</Text>
      <Text style={styles.hint}>Reference panel — re-renders on ANY runtime change.</Text>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
      <Text style={styles.count}>this panel renders: {renders}</Text>
    </View>
  )
}

export default function ReactivityScreen(): ReactElement {
  const [resetKey, setResetKey] = useState(0)

  const handleReset = () => {
    setResetKey((value) => value + 1)
  }

  return (
    <View style={layout.root}>
      <Backdrop />
      <ScrollView style={layout.scroll} contentContainerStyle={layout.content}>
        <View key={resetKey} style={layout.inner}>
          <Controls onReset={handleReset} />
          <RuntimeReadout />
          <View style={layout.grid}>
            <StaticProbe />
            <ThemeProbe />
            <DimensionsProbe />
            <InsetsProbe />
            <ColorSchemeProbe />
            <ReduceMotionProbe />
            <InlineThemeProbe />
            <VariantThemeProbe />
            <ThemeAndDimensionsProbe />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
