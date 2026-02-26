import { ScrollView, Text, TouchableOpacity } from "react-native"

import { useRouter } from "expo-router"

import { StyleSheet, useStyles } from "@dripstyle/core"

const BENCHMARKS = [
  {
    route: "/benchmark/rn-stylesheet",
    title: "React Native StyleSheet",
    description: "RN StyleSheet.create({}) — baseline, no dripstyle overhead"
  },
  {
    route: "/benchmark/static",
    title: "Static StyleSheet",
    description: "StyleSheet.create({}) — plain object, baseline"
  },
  {
    route: "/benchmark/factory",
    title: "Factory StyleSheet",
    description: "StyleSheet.create(({ theme }) => {}) — factory + useStyles()"
  },
  {
    route: "/benchmark/variants",
    title: "createVariant()",
    description: "Map-based variant system with cache"
  },
  {
    route: "/benchmark/themed-colors",
    title: "Themed Colors",
    description: "Factory reading all colors from theme.colors — worst case"
  }
]

const stylesheet = StyleSheet.create(({ theme }) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  content: {
    padding: 16,
    gap: 12
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.foreground,
    marginBottom: 4
  },
  description: {
    fontSize: 13,
    color: theme.colors.mutedForeground
  }
}))

export default function BenchmarkMenu() {
  const styles = useStyles(stylesheet)
  const router = useRouter()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {BENCHMARKS.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.card}
          onPress={() => router.push(item.route as never)}
          activeOpacity={0.7}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}
