import type { AbortSignalWithReason } from './types'

export const assertFunction: (
  func: unknown,
  expected: string
) => asserts func is (...args: unknown[]) => unknown = (
  func: unknown,
  expected: string
) => {
  if (typeof func !== 'function') {
    throw new TypeError(`${expected} is not a function`)
  }
}

export const noop = () => {}

export const catchRejection = <T>(
  promise: Promise<T>,
  onError = noop
): Promise<T> => {
  promise.catch(onError)

  return promise
}

export const addAbortSignalListener = (
  abortSignal: AbortSignal,
  callback: (evt: Event) => void
) => {
  abortSignal.addEventListener('abort', callback, { once: true })
  return () => abortSignal.removeEventListener('abort', callback)
}

/**
 * Calls `abortController.abort(reason)` and patches `signal.reason`.
 * if it is not supported.
 *
 * At the time of writing `signal.reason` is available in FF chrome, edge node 17 and deno.
 * @param abortController
 * @param reason
 * @returns
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/reason
 */
export const abortControllerWithReason = <T>(
  abortController: AbortController,
  reason: T
): void => {
  type Consumer<T> = (val: T) => void

  const signal = abortController.signal as AbortSignalWithReason<T>

  if (signal.aborted) {
    return
  }

  // Patch `reason` if necessary.
  // - We use defineProperty here because reason is a getter of `AbortSignal.__proto__`.
  // - We need to patch 'reason' before calling `.abort()` because listeners to the 'abort'
  // event are are notified immediately.
  if (!('reason' in signal)) {
    Object.defineProperty(signal, 'reason', {
      enumerable: true,
      value: reason,
      configurable: true,
      writable: true,
    })
  }

  ;(abortController.abort as Consumer<typeof reason>)(reason)
}
