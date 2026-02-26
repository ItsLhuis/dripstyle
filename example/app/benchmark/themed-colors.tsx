import { ScrollView, Text, TouchableOpacity, View } from "react-native"

import { StyleSheet, useStyles } from "@dripstyle/core"

import TimedRender from "../../components/TimedRender"

const COUNT = 250

const stylesheet = StyleSheet.create(({ theme }) => ({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 4,
    backgroundColor: theme.colors.background
  },
  touchable: {
    margin: 5
  },
  cardEven: {
    borderColor: theme.colors.ring,
    borderWidth: 2,
    padding: 10,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 8
  },
  cardOdd: {
    borderColor: theme.colors.border,
    borderWidth: 2,
    padding: 10,
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: 8
  },
  titleEven: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primaryForeground
  },
  titleOdd: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.secondaryForeground
  },
  bodyEven: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.primaryForeground
  },
  bodyOdd: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.mutedForeground
  }
}))

type ItemProps = { index: number }

function ThemedItem({ index }: ItemProps) {
  const styles = useStyles(stylesheet)
  const isEven = index % 2 === 0

  return (
    <TouchableOpacity
      style={styles.touchable}
      onPress={() => alert(`Item ${index} clicked!`)}
    >
      <View style={isEven ? styles.cardEven : styles.cardOdd}>
        <Text style={isEven ? styles.titleEven : styles.titleOdd}>Item {index}</Text>
        <Text style={isEven ? styles.bodyEven : styles.bodyOdd}>Themed</Text>
      </View>
    </TouchableOpacity>
  )
}

export default function ThemedColorsBenchmark() {
  const styles = useStyles(stylesheet)

  return (
    <TimedRender>
      <ScrollView contentContainerStyle={styles.container}>
        {new Array(COUNT).fill(0).map((_, i) => (
          <ThemedItem key={i} index={i} />
        ))}
      </ScrollView>
    </TimedRender>
  )
}
