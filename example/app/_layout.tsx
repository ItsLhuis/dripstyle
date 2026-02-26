import "../lib/dripstyle"

import { Fragment } from "react"

import { StatusBar } from "expo-status-bar"

import { Stack } from "expo-router"

import { ThemeProvider } from "@dripstyle/core"

export const unstable_settings = {
  anchor: "index"
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Fragment>
        <Stack>
          <Stack.Screen name="index" options={{ title: "Benchmarks" }} />
          <Stack.Screen name="benchmark" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </Fragment>
    </ThemeProvider>
  )
}
