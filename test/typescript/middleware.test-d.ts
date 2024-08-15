import type {
  Action,
  Dispatch,
  Middleware,
  MiddlewareAPI,
  Reducer
} from 'redux'
import { applyMiddleware, createStore } from 'redux'

type PromiseDispatch = <T extends Action>(promise: Promise<T>) => Promise<T>

interface Thunk<R, S, DispatchExt = {}> {
  (dispatch: Dispatch & ThunkDispatch<S> & DispatchExt, getState: () => S): R
}

interface ThunkDispatch<S, DispatchExt = {}> {
  <R>(thunk: Thunk<R, S, DispatchExt>): R
}

declare const logger: () => Middleware

declare const promise: () => Middleware<PromiseDispatch>

declare const thunk: <S, DispatchExt>() => Middleware<
  ThunkDispatch<S, DispatchExt>,
  S,
  Dispatch & ThunkDispatch<S>
>

describe('type tests', () => {
  test("Logger middleware doesn't add any extra types to dispatch, just logs actions and state.", () => {
    const loggerMiddleware: Middleware =
      ({ getState }) =>
      next =>
      action => {
        console.log('will dispatch', action)

        // Call the next dispatch method in the middleware chain.
        const returnValue = next(action)

        console.log('state after dispatch', getState())

        // This will likely be the action itself, unless
        // a middleware further in chain changed it.
        return returnValue
      }
  })

  test('Promise middleware adds support for dispatching promises.', () => {
    const promiseMiddleware: Middleware<PromiseDispatch> =
      ({ dispatch }) =>
      next =>
      action => {
        if (action instanceof Promise) {
          action.then(dispatch)
          return action
        }

        return next(action)
      }

    return promiseMiddleware
  })

  test('Thunk middleware adds support for dispatching thunks.', () => {
    function thunk<S, DispatchExt>() {
      const thunkMiddleware: Middleware<
        ThunkDispatch<S, DispatchExt>,
        S,
        Dispatch & ThunkDispatch<S>
      > = api => next => action =>
        typeof action === 'function'
          ? action(api.dispatch, api.getState)
          : next(action)

      return thunkMiddleware
    }
  })

  test('middleware that expects exact state type.', () => {
    type State = { field: 'string' }

    const customMiddleware: Middleware<{}, State> = api => next => action => {
      expectTypeOf(api.getState()).toHaveProperty('field')

      expectTypeOf(api.getState()).not.toHaveProperty('wrongField')

      return next(action)
    }
  })

  test('middleware that expects custom dispatch.', () => {
    type MyAction = { type: 'INCREMENT' } | { type: 'DECREMENT' }

    // dispatch that expects action union
    type MyDispatch = Dispatch<MyAction>

    const customDispatch: Middleware =
      (api: MiddlewareAPI<MyDispatch>) => next => action => {
        expectTypeOf(api.dispatch).toBeCallableWith({ type: 'INCREMENT' })

        expectTypeOf(api.dispatch).toBeCallableWith({ type: 'DECREMENT' })

        // `.not.toMatchTypeOf` does not work in this scenario.
        expectTypeOf(api.dispatch)
          .parameter(0)
          .not.toEqualTypeOf({ type: 'UNKNOWN' })
      }
  })

  test('test the type of store.dispatch after applying different middleware.', () => {
    interface State {
      someField: 'string'
    }
    const reducer: Reducer<State> = null as any

    test('logger', () => {
      const storeWithLogger = createStore(reducer, applyMiddleware(logger()))
      // can only dispatch actions
      expectTypeOf(storeWithLogger.dispatch).toBeCallableWith({
        type: 'INCREMENT'
      })

      expectTypeOf(storeWithLogger.dispatch)
        .parameter(0)
        .not.toMatchTypeOf(Promise.resolve({ type: 'INCREMENT' }))

      expectTypeOf(storeWithLogger.dispatch)
        .parameter(0)
        .not.toMatchTypeOf('not-an-action')
    })

    test('promise', () => {
      const storeWithPromise = createStore(reducer, applyMiddleware(promise()))

      // can dispatch actions and promises
      // `.toBeCallableWith or .parameter(0).toMatchTypeOf`
      // do not work in this scenario.
      storeWithPromise.dispatch({ type: 'INCREMENT' })

      storeWithPromise.dispatch(Promise.resolve({ type: 'INCREMENT' }))

      expectTypeOf(storeWithPromise.dispatch)
        .parameter(0)
        .not.toMatchTypeOf('not-an-action')

      expectTypeOf(storeWithPromise.dispatch)
        .parameter(0)
        .not.toMatchTypeOf(Promise.resolve('not-an-action'))
    })

    test('promise + logger', () => {
      const storeWithPromiseAndLogger = createStore(
        reducer,
        applyMiddleware(promise(), logger())
      )

      // can dispatch actions and promises
      // `.toBeCallableWith or .parameter(0).toMatchTypeOf`
      // do not work in this scenario.
      storeWithPromiseAndLogger.dispatch({ type: 'INCREMENT' })

      storeWithPromiseAndLogger.dispatch(Promise.resolve({ type: 'INCREMENT' }))

      expectTypeOf(storeWithPromiseAndLogger.dispatch)
        .parameter(0)
        .not.toMatchTypeOf('not-an-action')

      expectTypeOf(storeWithPromiseAndLogger.dispatch)
        .parameter(0)
        .not.toMatchTypeOf(Promise.resolve('not-an-action'))
    })

    test('promise + thunk', () => {
      const storeWithPromiseAndThunk = createStore(
        reducer,
        applyMiddleware(promise(), thunk<State, PromiseDispatch>(), logger())
      )

      // can dispatch actions, promises and thunks
      // `.toBeCallableWith or .parameter(0).toMatchTypeOf`
      // do not work in this scenario.
      storeWithPromiseAndThunk.dispatch({ type: 'INCREMENT' })

      // `.toBeCallableWith or .parameter(0).toMatchTypeOf`
      // do not work in this scenario.
      storeWithPromiseAndThunk.dispatch(Promise.resolve({ type: 'INCREMENT' }))

      storeWithPromiseAndThunk.dispatch((dispatch, getState) => {
        expectTypeOf(getState()).toHaveProperty('someField')

        expectTypeOf(getState()).not.toHaveProperty('wrongField')

        // injected dispatch accepts actions, thunks and promises
        // `.toBeCallableWith or .parameter(0).toMatchTypeOf`
        // do not work in this scenario.
        dispatch({ type: 'INCREMENT' })

        // `.toBeCallableWith or .parameter(0).toMatchTypeOf`
        // do not work in this scenario.
        dispatch(dispatch => dispatch({ type: 'INCREMENT' }))

        expectTypeOf(dispatch).toBeCallableWith(
          Promise.resolve({ type: 'INCREMENT' })
        )

        expectTypeOf(dispatch).parameter(0).not.toMatchTypeOf('not-an-action')
      })

      expectTypeOf(storeWithPromiseAndThunk.dispatch)
        .parameter(0)
        .not.toMatchTypeOf('not-an-action')

      expectTypeOf(storeWithPromiseAndThunk.dispatch)
        .parameter(0)
        .not.toMatchTypeOf(Promise.resolve('not-an-action'))
    })

    test('test variadic signature.', () => {
      const storeWithLotsOfMiddleware = createStore(
        reducer,
        applyMiddleware<PromiseDispatch>(
          promise(),
          logger(),
          logger(),
          logger(),
          logger(),
          logger()
        )
      )

      // `.toBeCallableWith or .parameter(0).toMatchTypeOf`
      // do not work in this scenario.
      storeWithLotsOfMiddleware.dispatch({ type: 'INCREMENT' })

      expectTypeOf(storeWithLotsOfMiddleware.dispatch).toBeCallableWith(
        Promise.resolve({ type: 'INCREMENT' })
      )
    })
  })
})
