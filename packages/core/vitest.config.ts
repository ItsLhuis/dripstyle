import { defineConfig } from "vitest/config"

export default defineConfig({
  define: {
    __DEV__: "true"
  },
  test: {
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"],
    typecheck: {
      tsconfig: "./tsconfig.typecheck.json",
      include: ["src/__tests__/**/*.test-d.ts"]
    }
  }
})
