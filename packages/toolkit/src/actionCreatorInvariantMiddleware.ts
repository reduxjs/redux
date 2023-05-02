import type { Middleware } from 'redux'
import { isActionCreator as isRTKAction } from './createAction'

export interface ActionCreatorInvariantMiddlewareOptions {
  /**
   * The function to identify whether a value is an action creator.
   * The default checks for a function with a static type property and match method.
   */
  isActionCreator?: (action: unknown) => action is Function & { type?: unknown }
}

export function getMessage(type?: unknown) {
  return `Detected an action creator with type "${
    type || 'unknown'
  }" being dispatched. 
Make sure you're calling the action before dispatching, i.e. \`dispatch(actionCreator())\` instead of \`dispatch(actionCreator)\`. This is necessary even if the action has no payload.`
}

export function createActionCreatorInvariantMiddleware(
  options: ActionCreatorInvariantMiddlewareOptions = {}
): Middleware {
  if (process.env.NODE_ENV === 'production') {
    return () => (next) => (action) => next(action)
  }
  const { isActionCreator = isRTKAction } = options
  return () => (next) => (action) => {
    if (isActionCreator(action)) {
      console.warn(getMessage(action.type))
    }
    return next(action)
  }
}
