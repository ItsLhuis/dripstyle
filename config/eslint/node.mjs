import globals from "globals"

import base from "./base.mjs"

const nodeConfig = [
  ...base,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.node
      }
    }
  }
]

export default nodeConfig
