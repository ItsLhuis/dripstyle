import { defineConfig } from "tsup"

export default defineConfig({
  entry: {
    "tailwind/index": "src/tailwind/index.ts",
  },
  format: ["esm", "cjs"],
  outExtension({ format }) {
    return { js: format === "esm" ? ".js" : ".cjs" }
  },
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  outDir: "dist",
  external: ["@dripstyle/core", "react", "react-native"],
})
