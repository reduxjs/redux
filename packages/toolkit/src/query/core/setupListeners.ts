import type {
  ThunkDispatch,
  ActionCreatorWithoutPayload, // Workaround for API-Extractor
} from '@reduxjs/toolkit'
import { createAction } from '@reduxjs/toolkit'

export const onFocus = /* @__PURE__ */ createAction('__rtkq/focused')
export const onFocusLost = /* @__PURE__ */ createAction('__rtkq/unfocused')
export const onOnline = /* @__PURE__ */ createAction('__rtkq/online')
export const onOffline = /* @__PURE__ */ createAction('__rtkq/offline')

let initialized = false

/**
 * A utility used to enable `refetchOnMount` and `refetchOnReconnect` behaviors.
 * It requires the dispatch method from your store.
 * Calling `setupListeners(store.dispatch)` will configure listeners with the recommended defaults,
 * but you have the option of providing a callback for more granular control.
 *
 * @example
 * ```ts
 * setupListeners(store.dispatch)
 * ```
 *
 * @param dispatch - The dispatch method from your store
 * @param customHandler - An optional callback for more granular control over listener behavior
 * @returns Return value of the handler.
 * The default handler returns an `unsubscribe` method that can be called to remove the listeners.
 */
export function setupListeners(
  dispatch: ThunkDispatch<any, any, any>,
  customHandler?: (
    dispatch: ThunkDispatch<any, any, any>,
    actions: {
      onFocus: typeof onFocus
      onFocusLost: typeof onFocusLost
      onOnline: typeof onOnline
      onOffline: typeof onOffline
    }
  ) => () => void
) {
  function defaultHandler() {
    const handleFocus = () => dispatch(onFocus())
    const handleFocusLost = () => dispatch(onFocusLost())
    const handleOnline = () => dispatch(onOnline())
    const handleOffline = () => dispatch(onOffline())
    const handleVisibilityChange = () => {
      if (window.document.visibilityState === 'visible') {
        handleFocus()
      } else {
        handleFocusLost()
      }
    }

    if (!initialized) {
      if (typeof window !== 'undefined' && window.addEventListener) {
        // Handle focus events
        window.addEventListener(
          'visibilitychange',
          handleVisibilityChange,
          false
        )
        window.addEventListener('focus', handleFocus, false)

        // Handle connection events
        window.addEventListener('online', handleOnline, false)
        window.addEventListener('offline', handleOffline, false)
        initialized = true
      }
    }
    const unsubscribe = () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      initialized = false
    }
    return unsubscribe
  }

  return customHandler
    ? customHandler(dispatch, { onFocus, onFocusLost, onOffline, onOnline })
    : defaultHandler()
}
