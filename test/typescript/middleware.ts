import {
  Middleware,
  MiddlewareAPI,
  applyMiddleware,
  StoreEnhancer,
  createStore,
  Dispatch,
  Reducer,
  Action,
  AnyAction
} from 'redux'

/**
 * Logger middleware doesn't add any extra types to dispatch, just logs actions
 * and state.
 */
function logger() {
  const loggerMiddleware: Middleware = ({ getState }: MiddlewareAPI) => (
    next: Dispatch
  ) => action => {
    console.log('will dispatch', action)

    // Call the next dispatch method in the middleware chain.
    const returnValue = next(action)

    console.log('state after dispatch', getState())

    // This will likely be the action itself, unless
    // a middleware further in chain changed it.
    return returnValue
  }
}

/**
 * Promise middleware adds support for dispatching promises.
 */
function promise() {
  const promiseMiddleware: Middleware = ({ dispatch }: MiddlewareAPI) => (
    next: Dispatch
  ) => (action: AnyAction | Promise<AnyAction>) => {
    if (action instanceof Promise) {
      action.then(dispatch)
      return action
    }

    return next(action)
  }
}

/**
 * Thunk middleware adds support for dispatching thunks.
 */
function thunk() {
  type Thunk<R, S> = (dispatch: Dispatch, getState: () => S) => R

  const thunkMiddleware: Middleware = ({
    dispatch,
    getState
  }: MiddlewareAPI) => (next: Dispatch) => <R>(
    action: AnyAction | Thunk<R, any>
  ) =>
    typeof action === 'function' ? action(dispatch, getState) : next(action)
}

/**
 * Middleware that expects exact state type.
 */
function customState() {
  type State = { field: 'string' }

  const customMiddleware: Middleware<State> = (api: MiddlewareAPI<State>) => (
    next: Dispatch
  ) => action => {
    api.getState().field
    // typings:expect-error
    api.getState().wrongField

    return next(action)
  }
}

function apply() {
  const m1: Middleware = null as any
  const m2: Middleware<{ some: 'state' }> = null as any

  const e1: StoreEnhancer = applyMiddleware(m1, m2)
  const e2: StoreEnhancer<Promise<AnyAction>> = applyMiddleware<
    Promise<AnyAction>
  >(m1, m2)
}
