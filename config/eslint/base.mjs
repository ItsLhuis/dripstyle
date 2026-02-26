import globals from "globals"

import js from "@eslint/js"

import tseslint from "typescript-eslint"

const baseConfig = tseslint.config(
  { ignores: ["**/dist/**", "**/.turbo/**", "**/node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        __DEV__: "readonly"
      }
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "consistent-return": "error",
      eqeqeq: ["error", "always"],
      "no-duplicate-imports": "error",
      "@typescript-eslint/no-empty-object-type": ["error", { allowInterfaces: "with-single-extends" }]
    }
  }
)

export default baseConfig
