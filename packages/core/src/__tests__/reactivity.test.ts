import { afterEach, describe, expect, test, vi } from "vitest"

import { clearAllListeners, emit, emitMany, subscribe } from "../reactivity"

afterEach(() => {
  clearAllListeners()
})

describe("reactivity bus", () => {
  test("invokes the listener with the key when a subscribed key is emitted", () => {
    const listener = vi.fn()
    subscribe(["theme"], listener)

    emit("theme")

    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith("theme")
  })

  test("does not invoke the listener when an unsubscribed key is emitted", () => {
    const listener = vi.fn()
    subscribe(["theme"], listener)

    emit("dimensions")

    expect(listener).not.toHaveBeenCalled()
  })

  test("invokes a multi-key listener once per emitted key", () => {
    const listener = vi.fn()
    subscribe(["dimensions", "insets"], listener)

    emit("dimensions")
    emit("insets")

    expect(listener).toHaveBeenCalledTimes(2)
  })

  test("stops invoking the listener after unsubscribe removes it from every key", () => {
    const listener = vi.fn()
    const unsubscribe = subscribe(["theme", "dimensions"], listener)

    unsubscribe()
    emit("theme")
    emit("dimensions")

    expect(listener).not.toHaveBeenCalled()
  })

  test("only removes the unsubscribed listener, leaving others registered", () => {
    const first = vi.fn()
    const second = vi.fn()
    const unsubscribeFirst = subscribe(["theme"], first)
    subscribe(["theme"], second)

    unsubscribeFirst()
    emit("theme")

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledOnce()
  })
})

describe("emitMany", () => {
  test("invokes a listener at most once when several of its keys are emitted together", () => {
    const listener = vi.fn()
    subscribe(["theme", "dimensions", "insets"], listener)

    emitMany(["theme", "dimensions", "insets"])

    expect(listener).toHaveBeenCalledOnce()
  })

  test("invokes the listener with the first matching emitted key", () => {
    const listener = vi.fn()
    subscribe(["insets"], listener)

    emitMany(["theme", "insets"])

    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith("insets")
  })

  test("does not invoke a listener when none of its keys are emitted", () => {
    const listener = vi.fn()
    subscribe(["theme"], listener)

    emitMany(["dimensions", "insets"])

    expect(listener).not.toHaveBeenCalled()
  })
})

describe("clearAllListeners", () => {
  test("removes every registered listener across all keys", () => {
    const listener = vi.fn()
    subscribe(["theme", "reduceMotion"], listener)

    clearAllListeners()
    emit("theme")
    emit("reduceMotion")

    expect(listener).not.toHaveBeenCalled()
  })
})
