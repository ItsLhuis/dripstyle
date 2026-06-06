import { Pressable, ScrollView, Text, View } from "react-native"

import { StyleSheet, useStyles } from "@dripstyle/core"

import TimedRender from "../../components/TimedRender"

const COUNT = 250

const stylesheet = StyleSheet.create(({ theme, runtime }) => ({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 4,
    paddingBottom: runtime.insets.bottom + 4,
    backgroundColor: theme.colors.background
  },
  touchable: {
    margin: 5
  },
  card: (options: { selected: boolean; tone: "primary" | "secondary" }) => ({
    alignItems: "center" as const,
    backgroundColor: options.tone === "primary" ? theme.colors.primary : theme.colors.secondary,
    borderColor: options.selected ? theme.colors.ring : theme.colors.border,
    borderRadius: options.selected ? 12 : 8,
    borderWidth: 2,
    justifyContent: "center" as const,
    minHeight: runtime.isLandscape ? 86 : 104,
    padding: options.selected ? 12 : 10,
    width: 112
  }),
  pressedCard: (pressed: boolean) => ({
    opacity: pressed ? 0.72 : 1,
    transform: [{ scale: pressed ? 0.98 : 1 }]
  }),
  title: (tone: "primary" | "secondary", selected: boolean) => ({
    color: tone === "primary" ? theme.colors.primaryForeground : theme.colors.secondaryForeground,
    fontSize: selected ? 22 : 20,
    fontWeight: selected ? ("800" as const) : ("700" as const)
  }),
  body: (muted: boolean) => ({
    color: muted ? theme.colors.mutedForeground : theme.colors.primaryForeground,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    textAlign: "center" as const
  }),
  badge: (selected: boolean) => ({
    backgroundColor: selected ? theme.colors.accent : theme.colors.muted,
    borderRadius: 999,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 3
  }),
  badgeText: (selected: boolean) => ({
    color: selected ? theme.colors.accentForeground : theme.colors.mutedForeground,
    fontSize: 11,
    fontWeight: "700" as const
  })
}))

type ItemProps = { index: number }

function InlineFunctionItem({ index }: ItemProps) {
  const styles = useStyles(stylesheet)

  const selected = index % 3 === 0
  const tone = index % 2 === 0 ? "primary" : "secondary"

  return (
    <Pressable style={styles.touchable} onPress={() => alert(`Item ${index} clicked!`)}>
      {({ pressed }) => (
        <View style={[styles.card({ selected, tone }), styles.pressedCard(pressed)]}>
          <Text style={styles.title(tone, selected)}>Item {index}</Text>
          <Text style={styles.body(tone === "secondary")}>Inline function</Text>
          <View style={styles.badge(selected)}>
            <Text style={styles.badgeText(selected)}>{selected ? "selected" : "default"}</Text>
          </View>
        </View>
      )}
    </Pressable>
  )
}

export default function InlineFunctionsBenchmark() {
  const styles = useStyles(stylesheet)

  return (
    <TimedRender>
      <ScrollView contentContainerStyle={styles.container}>
        {new Array(COUNT).fill(0).map((_, i) => (
          <InlineFunctionItem key={i} index={i} />
        ))}
      </ScrollView>
    </TimedRender>
  )
}
