import { memo, useRef, type ReactElement } from "react"

import { Pressable, ScrollView, Text, View } from "react-native"

import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"

import { StyleSheet, useAnimatedTheme, useStyles, useTheme } from "@dripstyle/core"

/**
 * Reanimated test screen.
 *
 * `useAnimatedTheme()` returns a Reanimated `SharedValue<Theme>` that tracks the active theme. Read
 * it inside a `useAnimatedStyle` worklet and the colors interpolate on the UI thread — no React
 * re-render is involved. Tap "Switch theme" and compare the two cards: the "Instant" card resolves
 * its colors through `useStyles` and snaps, while the "Animated" card eases every color via
 * `withTiming`.
 */

// Reads and writes a ref during render to count how many times a card actually re-rendered. The
// value is display-only — the whole point is that the animated card re-renders once per theme
// switch (to hand the new theme to the worklet), not once per animation frame.
function useRenderCount(): number {
  const countRef = useRef(0)

  // eslint-disable-next-line react-hooks/refs
  countRef.current += 1

  // eslint-disable-next-line react-hooks/refs
  return countRef.current
}

const TRANSITION = { duration: 350 }

const SWATCH_KEYS = ["primary", "accent", "destructive", "success"] as const

type SwatchKey = (typeof SWATCH_KEYS)[number]

const layout = StyleSheet.create(({ theme }) => ({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, gap: 16 }
}))

const controlsSheet = StyleSheet.create(({ theme }) => ({
  panel: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12
  },
  heading: { fontSize: 18, fontWeight: "800", color: theme.colors.foreground },
  intro: { fontSize: 13, color: theme.colors.mutedForeground, lineHeight: 18 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
  state: { fontSize: 13, fontWeight: "600", color: theme.colors.foreground },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  primaryButtonText: { color: theme.colors.primaryForeground, fontWeight: "700", fontSize: 13 },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8
  },
  secondaryButtonText: { color: theme.colors.secondaryForeground, fontWeight: "700", fontSize: 13 }
}))

const instantSheet = StyleSheet.create(({ theme }) => ({
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 10
  },
  title: { fontSize: 15, fontWeight: "700", color: theme.colors.foreground },
  meta: { fontSize: 12, color: theme.colors.mutedForeground },
  swatchRow: { flexDirection: "row", gap: 8 },
  swatch: (colorKey: SwatchKey) => ({
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: theme.colors[colorKey]
  })
}))

// Static layout shared by the animated card. It reads no theme, so it never re-renders — every color
// on this card arrives through a `useAnimatedStyle` worklet instead.
const animatedChrome = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 10 },
  title: { fontSize: 15, fontWeight: "700" },
  meta: { fontSize: 12 },
  swatchRow: { flexDirection: "row", gap: 8 },
  swatch: { flex: 1, height: 44, borderRadius: 8 }
})

const InstantCard = memo(function InstantCard(): ReactElement {
  const styles = useStyles(instantSheet)

  const renders = useRenderCount()

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Instant · useStyles</Text>
      <Text style={styles.meta}>Colors resolve on render and snap to the new theme</Text>
      <View style={styles.swatchRow}>
        {SWATCH_KEYS.map((colorKey) => (
          <View key={colorKey} style={styles.swatch(colorKey)} />
        ))}
      </View>
      <Text style={styles.meta}>renders: {renders}</Text>
    </View>
  )
})

function AnimatedSwatch({ colorKey }: { colorKey: SwatchKey }): ReactElement {
  const animatedTheme = useAnimatedTheme()

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(animatedTheme.value.colors[colorKey], TRANSITION)
  }))

  return <Animated.View style={[animatedChrome.swatch, animatedStyle]} />
}

const AnimatedCard = memo(function AnimatedCard(): ReactElement {
  const animatedTheme = useAnimatedTheme()

  const renders = useRenderCount()

  const cardStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(animatedTheme.value.colors.card, TRANSITION),
    borderColor: withTiming(animatedTheme.value.colors.border, TRANSITION)
  }))

  const titleStyle = useAnimatedStyle(() => ({
    color: withTiming(animatedTheme.value.colors.foreground, TRANSITION)
  }))

  const metaStyle = useAnimatedStyle(() => ({
    color: withTiming(animatedTheme.value.colors.mutedForeground, TRANSITION)
  }))

  return (
    <Animated.View style={[animatedChrome.card, cardStyle]}>
      <Animated.Text style={[animatedChrome.title, titleStyle]}>
        Animated · useAnimatedTheme
      </Animated.Text>
      <Animated.Text style={[animatedChrome.meta, metaStyle]}>
        Colors ease on the UI thread via useAnimatedStyle — no re-render
      </Animated.Text>
      <View style={animatedChrome.swatchRow}>
        {SWATCH_KEYS.map((colorKey) => (
          <AnimatedSwatch key={colorKey} colorKey={colorKey} />
        ))}
      </View>
      <Animated.Text style={[animatedChrome.meta, metaStyle]}>renders: {renders}</Animated.Text>
    </Animated.View>
  )
})

function Controls(): ReactElement {
  const { themeName, hasAdaptiveThemes, setTheme, setAdaptiveThemes } = useTheme()

  const styles = useStyles(controlsSheet)

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
      <Text style={styles.heading}>Animated theme transitions</Text>
      <Text style={styles.intro}>
        Both cards show the same theme colors. The top card resolves them with useStyles and snaps;
        the bottom card reads useAnimatedTheme() inside useAnimatedStyle worklets, so every color
        interpolates on the UI thread. Watch the render counters: switching the theme bumps each
        card exactly once, then the animated card eases for 350ms with no further re-renders.
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
      </View>
    </View>
  )
}

export default function ReanimatedScreen(): ReactElement {
  const styles = useStyles(layout)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Controls />
      <InstantCard />
      <AnimatedCard />
    </ScrollView>
  )
}
