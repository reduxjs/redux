import { TaskAbortError } from './exceptions'
import type { TaskResult } from './types'
import { noop } from './utils'

/**
 * Synchronously raises {@link TaskAbortError} if the task tied to the input `signal` has been cancelled.
 * @param signal
 * @param reason
 * @see {TaskAbortError}
 */
export const validateActive = (signal: AbortSignal, reason?: string): void => {
  if (signal.aborted) {
    throw new TaskAbortError(reason)
  }
}

/**
 * Returns a promise that will reject {@link TaskAbortError} if the task is cancelled.
 * @param signal
 * @returns
 */
export const promisifyAbortSignal = (
  signal: AbortSignal,
  reason?: string
): Promise<never> => {
  const promise = new Promise<never>((_, reject) => {
    const notifyRejection = () => reject(new TaskAbortError(reason))

    if (signal.aborted) {
      notifyRejection()
    } else {
      signal.addEventListener('abort', notifyRejection, { once: true })
    }
  })

  // We do not want 'unhandledRejection' warnings or crashes caused by cancelled tasks
  promise.catch(noop)

  return promise
}

/**
 * Runs a task and returns promise that resolves to {@link TaskResult}.
 *
 * Second argument is an optional `cleanUp` function that always runs after task.
 * @returns
 */
export const runTask = async <T>(
  task: () => Promise<T>,
  cleanUp?: () => void
): Promise<TaskResult<T>> => {
  try {
    await Promise.resolve()
    const value = await task()
    return {
      status: 'ok',
      value,
    }
  } catch (error: any) {
    return {
      status: error instanceof TaskAbortError ? 'cancelled' : 'rejected',
      error,
    }
  } finally {
    cleanUp?.()
  }
}

/**
 * Given an input `AbortSignal` and a promise returns another promise that resolves
 * as soon the input promise is provided or rejects as soon as
 * `AbortSignal.abort` is `true`.
 * @param signal
 * @returns
 */
export const createPause = <T>(signal: AbortSignal) => {
  return async (promise: Promise<T>): Promise<T> => {
    validateActive(signal)
    const result = await Promise.race([promisifyAbortSignal(signal), promise])
    validateActive(signal)
    return result
  }
}

/**
 * Given an input `AbortSignal` and `timeoutMs` returns a promise that resolves
 * after `timeoutMs` or rejects as soon as `AbortSignal.abort` is `true`.
 * @param signal
 * @returns
 */
export const createDelay = (signal: AbortSignal) => {
  const pause = createPause<void>(signal)
  return (timeoutMs: number): Promise<void> => {
    return pause(new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)))
  }
}
