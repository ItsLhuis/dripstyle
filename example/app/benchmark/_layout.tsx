import { Stack } from "expo-router"

export default function BenchmarkLayout() {
  return (
    <Stack>
      <Stack.Screen name="rn-stylesheet" options={{ title: "React Native StyleSheet (250 items)" }} />
      <Stack.Screen name="static" options={{ title: "Static StyleSheet (250 items)" }} />
      <Stack.Screen name="factory" options={{ title: "Factory StyleSheet (250 items)" }} />
      <Stack.Screen name="variants" options={{ title: "createVariant() (250 items)" }} />
      <Stack.Screen name="themed-colors" options={{ title: "Themed Colors (250 items)" }} />
    </Stack>
  )
}
