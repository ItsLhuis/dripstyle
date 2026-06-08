import { DEPENDENCY_KEYS, type DependencyKey } from "./dependencies"

/**
 * The internal reactivity bus: one listener set per {@link DependencyKey}. Pure (no React, no React
 * Native) so it stays allocation-light and import-side-effect-free — it runs on every device event.
 *
 * `useStyles` subscribes a single listener to every key and filters against the dependencies its
 * factory recorded; the device/store sources emit the specific key(s) that changed. Not exported
 * from the package barrel.
 */
type Listener = (key: DependencyKey) => void

const listenersByKey: Record<DependencyKey, Set<Listener>> = {
  theme: new Set(),
  dimensions: new Set(),
  insets: new Set(),
  colorScheme: new Set(),
  reduceMotion: new Set()
}

/**
 * Registers `listener` on each of `keys`.
 *
 * @returns An unsubscribe function that removes `listener` from every key it was added to.
 */
export function subscribe(keys: readonly DependencyKey[], listener: Listener): () => void {
  for (const key of keys) {
    listenersByKey[key].add(listener)
  }

  return () => {
    for (const key of keys) {
      listenersByKey[key].delete(listener)
    }
  }
}

/** Invokes every listener registered for `key`, passing the key. */
export function emit(key: DependencyKey): void {
  listenersByKey[key].forEach((listener) => {
    listener(key)
  })
}

/**
 * Emits several keys in one pass, invoking each listener at most once even when it is registered for
 * multiple of the emitted keys. The listener receives the first emitted key it matched.
 */
export function emitMany(keys: readonly DependencyKey[]): void {
  const seen = new Set<Listener>()

  for (const key of keys) {
    listenersByKey[key].forEach((listener) => {
      if (seen.has(listener)) return

      seen.add(listener)
      listener(key)
    })
  }
}

/** Removes every registered listener across all keys. For use in tests only. */
export function clearAllListeners(): void {
  for (const key of DEPENDENCY_KEYS) {
    listenersByKey[key].clear()
  }
}
