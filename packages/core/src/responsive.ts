import { getStore } from "./store"

import type { BreakpointName } from "./types"

/**
 * Returns the value for the largest defined breakpoint that is &le; the
 * current breakpoint. If no breakpoint qualifies, returns `undefined`.
 *
 * @example
 * ```ts
 * const styles = StyleSheet.create(({ runtime }) => ({
 *   container: {
 *     paddingHorizontal: responsive({ xs: 16, md: 24, lg: 32 }, runtime.breakpoint),
 *   }
 * }))
 * ```
 */
export function responsive<T>(
  values: Partial<Record<BreakpointName, T>>,
  breakpoint: BreakpointName
): T | undefined {
  const configured = getStore().breakpoints
  const order = Object.keys(configured).sort((a, b) => configured[a]! - configured[b]!)
  const currentIndex = order.indexOf(breakpoint)

  if (currentIndex === -1) return undefined

  let result: T | undefined

  for (let i = 0; i <= currentIndex; i++) {
    const key = order[i] as BreakpointName

    if (key in values) {
      result = values[key]
    }
  }

  return result
}
