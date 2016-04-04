import createStore from './createStore'

/**
 * Enhances the store creator in Redux, to allow scheduling of async `dispatch()`.
 *
 * @param {Function} enhancer The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} An enhanced Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
export default function enhanceCreateStore(enhancer) {
  if (typeof enhancer !== 'undefined' && typeof enhancer !== 'function') {
    throw new Error('Expected the enhancer to be a function.')
  }

  return function (reducer, initialState) {
    var finalStore = enhancer(createStore)(reducer, initialState, schedule)

    /**
     * Queues an action for dispatch. This is useful when dispatching async
     * actions as it will dispatch in the top store. This way all enhancers
     * are to able to properly dispatch regardless if they are on top or not.
     */
    function schedule(action) {
      setTimeout(() => finalStore.dispatch(action))
      return action
    }

    return finalStore
  }
}
