// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config")
const expoConfig = require("eslint-config-expo/flat")

module.exports = defineConfig([
  expoConfig,
  {
    settings: {
      react: {
        version: "19.1.0"
      }
    }
  },
  {
    ignores: ["dist/*"]
  }
])
