import { TaskAbortError } from './exceptions'
import type { AbortSignalWithReason, TaskResult } from './types'
import { addAbortSignalListener, catchRejection } from './utils'

/**
 * Synchronously raises {@link TaskAbortError} if the task tied to the input `signal` has been cancelled.
 * @param signal
 * @param reason
 * @see {TaskAbortError}
 */
export const validateActive = (signal: AbortSignal): void => {
  if (signal.aborted) {
    throw new TaskAbortError((signal as AbortSignalWithReason<string>).reason)
  }
}

/**
 * Returns a promise that will reject {@link TaskAbortError} if the task is cancelled.
 * @param signal
 * @returns
 */
export const promisifyAbortSignal = (
  signal: AbortSignalWithReason<string>
): Promise<never> => {
  return catchRejection(
    new Promise<never>((_, reject) => {
      const notifyRejection = () => reject(new TaskAbortError(signal.reason))

      if (signal.aborted) {
        notifyRejection()
      } else {
        addAbortSignalListener(signal, notifyRejection)
      }
    })
  )
}

/**
 * Runs a task and returns promise that resolves to {@link TaskResult}.
 * Second argument is an optional `cleanUp` function that always runs after task.
 *
 * **Note:** `runTask` runs the executor in the next microtask.
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
  return (promise: Promise<T>): Promise<T> => {
    return catchRejection(
      Promise.race([promisifyAbortSignal(signal), promise]).then((output) => {
        validateActive(signal)
        return output
      })
    )
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
