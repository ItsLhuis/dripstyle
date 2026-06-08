import type { RuntimeValues, StyleSheetContext, Theme } from "./types"

/**
 * Coarse, enumerated reactive dependency keys. A stylesheet factory records the subset it actually
 * reads; `useStyles` then re-renders only when one of those keys is emitted on the reactivity bus.
 *
 * - `theme` — any access on the theme object.
 * - `dimensions` — window/screen/breakpoint/orientation/scale fields.
 * - `insets` — safe-area insets and the derived status/navigation bars.
 * - `colorScheme` — system light/dark scheme (non-adaptive).
 * - `reduceMotion` — accessibility reduce-motion flag.
 */
export type DependencyKey = "theme" | "dimensions" | "insets" | "colorScheme" | "reduceMotion"

/** Every dependency key, used by `useStyles` to subscribe to the bus and filter against recorded keys. */
export const DEPENDENCY_KEYS: readonly DependencyKey[] = [
  "theme",
  "dimensions",
  "insets",
  "colorScheme",
  "reduceMotion"
]

/**
 * Maps each reactive {@link RuntimeValues} field to the dependency key that re-renders it. Fields not
 * listed here (`platform`, `isRTL`, `contentSizeCategory`) are process-constant or have no change
 * source, so they record no key and never cause a subscription. See the plan §2.1.
 */
export const RUNTIME_FIELD_TO_KEY: Partial<Record<keyof RuntimeValues, DependencyKey>> = {
  window: "dimensions",
  screen: "dimensions",
  orientation: "dimensions",
  isPortrait: "dimensions",
  isLandscape: "dimensions",
  breakpoint: "dimensions",
  breakpoints: "dimensions",
  pixelRatio: "dimensions",
  fontScale: "dimensions",
  insets: "insets",
  statusBar: "insets",
  navigationBar: "insets",
  colorScheme: "colorScheme",
  reduceMotion: "reduceMotion"
}

/**
 * Builds the `{ theme, runtime }` context a stylesheet factory runs against, with both values wrapped
 * in top-level tracking Proxies. Every property `get` records the corresponding {@link DependencyKey}
 * via `record` and returns the **real** underlying value, so produced styles are correct while the
 * accumulated key set drives selective re-rendering in `useStyles`.
 *
 * Only the top level is proxied — `theme.colors.primary` records `theme` on the `colors` get and
 * returns the real `colors` object, because a coarse key already covers the whole subtree.
 *
 * These Proxies run on the JS thread during factory evaluation only. They must never wrap the theme
 * handed to Reanimated worklets (Proxies are not worklet-safe); keep them inside the `useStyles` path.
 */
export function createTrackingContext(
  record: (key: DependencyKey) => void,
  sources: { theme: Theme; runtime: RuntimeValues }
): StyleSheetContext {
  const theme = new Proxy(sources.theme as object, {
    get(target, property) {
      record("theme")

      return Reflect.get(target, property, target)
    }
  }) as Theme

  const runtime = new Proxy(sources.runtime, {
    get(target, property) {
      const key =
        typeof property === "string"
          ? RUNTIME_FIELD_TO_KEY[property as keyof RuntimeValues]
          : undefined

      if (key) {
        record(key)
      }

      return Reflect.get(target, property, target)
    }
  })

  return { theme, runtime }
}
