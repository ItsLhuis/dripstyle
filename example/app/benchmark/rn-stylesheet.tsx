import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

import TimedRender from "../../components/TimedRender"

const COUNT = 250

type ItemProps = { index: number }

function RNItem({ index }: ItemProps) {
  const isEven = index % 2 === 0

  return (
    <TouchableOpacity
      style={styles.touchable}
      onPress={() => alert(`Item ${index} clicked!`)}
    >
      <View style={[styles.card, isEven ? styles.blueBackground : styles.grayBackground]}>
        <Text style={styles.title}>Item {index}</Text>
        <Text style={styles.body}>RN</Text>
      </View>
    </TouchableOpacity>
  )
}

export default function RNStyleSheetBenchmark() {
  return (
    <TimedRender>
      <ScrollView contentContainerStyle={styles.container}>
        {new Array(COUNT).fill(0).map((_, i) => (
          <RNItem key={i} index={i} />
        ))}
      </ScrollView>
    </TimedRender>
  )
}

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
