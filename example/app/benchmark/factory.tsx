import { ScrollView, Text, TouchableOpacity, View } from "react-native"

import { StyleSheet, useStyles } from "@dripstyle/core"

import TimedRender from "../../components/TimedRender"

const COUNT = 250

const stylesheet = StyleSheet.create(({ theme }) => ({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 4
  },
  touchable: {
    margin: 5
  },
  card: {
    borderColor: theme.colors.destructive,
    borderWidth: 2,
    padding: 10,
    width: 100,
    justifyContent: "center",
    alignItems: "center"
  },
  primaryBackground: {
    backgroundColor: theme.colors.primary
  },
  secondaryBackground: {
    backgroundColor: theme.colors.secondary
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primaryForeground
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.primaryForeground
  }
}))

type ItemProps = { index: number }

function FactoryItem({ index }: ItemProps) {
  const styles = useStyles(stylesheet)

  return (
    <TouchableOpacity
      style={styles.touchable}
      onPress={() => alert(`Item ${index} clicked!`)}
    >
      <View
        style={[
          styles.card,
          index % 2 === 0 ? styles.primaryBackground : styles.secondaryBackground
        ]}
      >
        <Text style={styles.title}>Item {index}</Text>
        <Text style={styles.body}>Factory</Text>
      </View>
    </TouchableOpacity>
  )
}

export default function FactoryBenchmark() {
  const styles = useStyles(stylesheet)

  return (
    <TimedRender>
      <ScrollView contentContainerStyle={styles.container}>
        {new Array(COUNT).fill(0).map((_, i) => (
          <FactoryItem key={i} index={i} />
        ))}
      </ScrollView>
    </TimedRender>
  )
}
