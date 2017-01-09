import { adaptEnhancerCreator } from './adaptEnhancer'

export default adaptEnhancerCreator(applyMiddleware)

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState`
 * functions as named arguments.
 *
 * @param {...Function} middleware The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
function applyMiddleware(...middleware) {
  return store => {
    const dispatchProxy = createDispatchProxy()

    const api = {
      getState: store.getState,
      dispatch: dispatchProxy.dispatch,
    }

    const dispatch = middleware
      .map(mid => mid(api))
      .reduceRight((next, mid) => mid(next), store.dispatch)

    dispatchProxy.replace(dispatch)
    return { dispatch }
  }
}

// Because the `finalDispatch` function isn't known until after the middleware
// have been composed, but it needs to be accessible to those middleware before
// then, it needs to be wrapped in a proxy function. To prevent that function
// from capturing `middleware` for the lifetime of the running application, it
// is defined outside of the `applyMiddleware` function.
function createDispatchProxy() {
  let finalDispatch = throwPrematureDispatch
  return {
    dispatch(...args) {
      return finalDispatch(...args)
    },
    replace(newDispatch) {
      finalDispatch = newDispatch
    },
  }
}

function throwPrematureDispatch() {
  throw new Error(
    'Dispatching while constructing your middleware is not allowed. Other'
    + ' middleware would not be applied to this dispatch.'
  )
}
