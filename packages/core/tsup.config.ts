import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  outExtension({ format }) {
    return { js: format === "esm" ? ".js" : ".cjs" }
  },
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-native", "react-native-reanimated", "react-native-safe-area-context"],
  esbuildOptions(options) {
    options.jsx = "automatic"
  },
  plugins: [
    {
      // esbuild rewrites the optional-peer `require()` guards (react-native-safe-area-context and
      // react-native-reanimated) into its `__require()` shim. Metro's dependency collector only
      // recognizes the bare `require` identifier, so those modules are never bundled and the call
      // throws at runtime — silently disabling safe-area insets and reanimated even when the peer
      // is installed. React Native resolves the CJS build, so restore a plain `require(` there.
      name: "metro-collectable-require",
      renderChunk(code, chunk) {
        if (!chunk.path.endsWith(".cjs")) return undefined

        if (!code.includes("__require(")) return undefined

        return { code: code.replace(/__require\(/g, "require(") }
      }
    }
  ]
})
