import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

import TimedRender from "../../components/TimedRender"

const COUNT = 250

const styles = StyleSheet.create({
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
    borderColor: "red",
    borderWidth: 2,
    padding: 10,
    width: 100,
    justifyContent: "center",
    alignItems: "center"
  },
  blueBackground: {
    backgroundColor: "blue"
  },
  grayBackground: {
    backgroundColor: "gray"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white"
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: "white"
  }
})

type ItemProps = { index: number }

function StaticItem({ index }: ItemProps) {
  return (
    <TouchableOpacity
      style={styles.touchable}
      onPress={() => alert(`Item ${index} clicked!`)}
    >
      <View style={[styles.card, index % 2 === 0 ? styles.blueBackground : styles.grayBackground]}>
        <Text style={styles.title}>Item {index}</Text>
        <Text style={styles.body}>Static</Text>
      </View>
    </TouchableOpacity>
  )
}

export default function StaticBenchmark() {
  return (
    <TimedRender>
      <ScrollView contentContainerStyle={styles.container}>
        {new Array(COUNT).fill(0).map((_, i) => (
          <StaticItem key={i} index={i} />
        ))}
      </ScrollView>
    </TimedRender>
  )
}
