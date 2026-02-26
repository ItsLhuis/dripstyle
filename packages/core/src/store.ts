declare const __DEV__: boolean

type StoreState = {
  registeredThemes: Record<string, unknown>
  breakpoints: Record<string, number>
  activeThemeName: string | null
  adaptiveThemes: boolean
  isConfigured: boolean
  isProviderMounted: boolean
  listeners: Set<() => void>
}

const store: StoreState = {
  registeredThemes: {},
  breakpoints: {},
  activeThemeName: null,
  adaptiveThemes: false,
  isConfigured: false,
  isProviderMounted: false,
  listeners: new Set(),
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
  notifyListeners()
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
 * Does not throw — styles render with an empty theme object.
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
