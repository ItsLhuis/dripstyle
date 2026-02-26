import { ScrollView, Text, TouchableOpacity, View } from "react-native"

import { StyleSheet, createVariant, useStyles } from "@dripstyle/core"

import TimedRender from "../../components/TimedRender"

const COUNT = 250

const cardVariant = createVariant({
  base: {
    borderWidth: 2,
    borderColor: "red",
    padding: 10,
    width: 100,
    justifyContent: "center" as const,
    alignItems: "center" as const
  },
  variants: {
    color: {
      blue: { backgroundColor: "blue" },
      gray: { backgroundColor: "gray" }
    },
    elevated: {
      true: { shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
      false: {}
    }
  },
  defaultVariants: { color: "blue", elevated: false }
})

const textVariant = createVariant({
  base: {
    color: "white"
  },
  variants: {
    size: {
      lg: { fontSize: 24, fontWeight: "bold" as const },
      sm: { fontSize: 16, lineHeight: 24 }
    }
  },
  defaultVariants: { size: "lg" }
})

const stylesheet = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 4
  },
  touchable: {
    margin: 5
  }
})

type ItemProps = { index: number }

function VariantItem({ index }: ItemProps) {
  const styles = useStyles(stylesheet)
  const isEven = index % 2 === 0

  return (
    <TouchableOpacity
      style={styles.touchable}
      onPress={() => alert(`Item ${index} clicked!`)}
    >
      <View style={cardVariant({ color: isEven ? "blue" : "gray", elevated: isEven })}>
        <Text style={textVariant({ size: "lg" })}>Item {index}</Text>
        <Text style={textVariant({ size: "sm" })}>Variant</Text>
      </View>
    </TouchableOpacity>
  )
}

export default function VariantsBenchmark() {
  const styles = useStyles(stylesheet)

  return (
    <TimedRender>
      <ScrollView contentContainerStyle={styles.container}>
        {new Array(COUNT).fill(0).map((_, i) => (
          <VariantItem key={i} index={i} />
        ))}
      </ScrollView>
    </TimedRender>
  )
}
