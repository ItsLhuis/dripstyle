import { emit } from "./reactivity"

declare const __DEV__: boolean

type StoreState = {
  registeredThemes: Record<string, unknown>
  breakpoints: Record<string, number>
  sortedBreakpoints: string[]
  activeThemeName: string | null
  adaptiveThemes: boolean
  isConfigured: boolean
  isProviderMounted: boolean
  hasWarnedInsetsAccess: boolean
  listeners: Set<() => void>
}

const store: StoreState = {
  registeredThemes: {},
  breakpoints: {},
  sortedBreakpoints: [],
  activeThemeName: null,
  adaptiveThemes: false,
  isConfigured: false,
  isProviderMounted: false,
  hasWarnedInsetsAccess: false,
  listeners: new Set()
}

/** Returns a read-only reference to the current store state. */
export function getStore(): Readonly<StoreState> {
  return store
}

/**
 * Merges partial state into the store and notifies all listeners.
 * `listeners` is excluded to prevent external replacement of the registry.
 */
export function setStore(partial: Partial<Omit<StoreState, "listeners">>): void {
  Object.assign(store, partial)

  if ("breakpoints" in partial) {
    store.sortedBreakpoints = Object.keys(store.breakpoints).sort(
      (first, second) => store.breakpoints[first] - store.breakpoints[second]
    )
  }

  notifyListeners()

  if (
    "registeredThemes" in partial ||
    "activeThemeName" in partial ||
    "adaptiveThemes" in partial
  ) {
    emit("theme")
  }
}

/**
 * Marks `<ThemeProvider>` as mounted without notifying listeners.
 *
 * Called synchronously during the provider's render (and its mount effect) so that
 * the first render of descendant components already observes `isProviderMounted === true`.
 * Intentionally bypasses {@link notifyListeners}: this flag only gates DEV warnings and
 * `assertNotConfiguredAfterMount`, so it must never trigger a re-render. Notifying while
 * the provider is rendering would warn about updating a component during render.
 */
export function markProviderMounted(): void {
  store.isProviderMounted = true
}

/** Marks `<ThemeProvider>` as unmounted without notifying listeners. */
export function markProviderUnmounted(): void {
  store.isProviderMounted = false
}

/**
 * Subscribes to store changes.
 *
 * @returns An unsubscribe function.
 */
export function subscribe(listener: () => void): () => void {
  store.listeners.add(listener)

  return () => {
    store.listeners.delete(listener)
  }
}

/** Invokes every registered store listener. Called automatically by `setStore`. */
export function notifyListeners(): void {
  store.listeners.forEach((listener) => {
    listener()
  })
}

/**
 * Resets all store state to initial values.
 * For use in tests only. Do not call in application code.
 */
export function resetStore(): void {
  store.registeredThemes = {}
  store.breakpoints = {}
  store.sortedBreakpoints = []
  store.activeThemeName = null
  store.adaptiveThemes = false
  store.isConfigured = false
  store.isProviderMounted = false
  store.hasWarnedInsetsAccess = false
  store.listeners = new Set()
}

/**
 * Throws in development if `configure()` is called after `<ThemeProvider>` mounts.
 *
 * @param action - Call site label, e.g. `"StyleSheet.configure"`.
 */
export function assertNotConfiguredAfterMount(action: string): void {
  if (__DEV__ && store.isProviderMounted) {
    throw new Error(
      `[dripstyle] ${action} must be called before <ThemeProvider> mounts. ` +
        `Move StyleSheet.configure() to the top of your app entry file, ` +
        `before any React rendering.`
    )
  }
}

/**
 * Warns in development when a stylesheet is created before `StyleSheet.configure()`.
 * Does not throw; styles render with an empty theme object.
 *
 * @param context - Call site label.
 */
export function warnIfNotConfigured(context: string): void {
  if (__DEV__ && !store.isConfigured) {
    console.warn(
      `[dripstyle] ${context} called before StyleSheet.configure(). ` +
        `Theme-dependent styles will use an empty theme object. ` +
        `Call StyleSheet.configure({ themes: { ... } }) before defining stylesheets.`
    )
  }
}

/**
 * Warns once in development when safe area insets are read before `<ThemeProvider>` mounts.
 *
 * Genuine pre-mount access (module load, or `Runtime.insets` used outside the provider tree)
 * returns zeros, so this flags it. Access from components rendered under `<ThemeProvider>` does
 * not warn, because the provider marks itself mounted during its render. See
 * {@link markProviderMounted}.
 */
export function warnIfInsetsAccessedBeforeMount(): void {
  if (__DEV__ && !store.isProviderMounted && !store.hasWarnedInsetsAccess) {
    store.hasWarnedInsetsAccess = true
    console.warn(
      "[dripstyle] Runtime.insets accessed before <ThemeProvider> mounted. " +
        "Insets default to zeros. Access insets inside components wrapped by ThemeProvider."
    )
  }
}
