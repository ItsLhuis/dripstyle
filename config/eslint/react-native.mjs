import reactNativePlugin from "eslint-plugin-react-native"

import reactConfig from "./react.mjs"

const reactNativeConfig = [
  ...reactConfig,
  {
    plugins: {
      "react-native": reactNativePlugin
    },
    rules: {
      ...(reactNativePlugin.configs?.recommended?.rules ?? {})
    }
  }
]

export default reactNativeConfig
