import { validateModernEnhancers } from './createStore'

// Transforms a modernEnhancer (store => partialStore) into a classicEnhancer
// (createStore => (reducer, preloadedState) => store) by wrapping it in an
// adapter function. This is to maintain backwards compatibility with the
// classic way of composing store enhancers with the `compose` function.
export default function adaptEnhancer(modernEnhancer) {
  if (typeof modernEnhancer !== 'function') {
    throw new Error(`Expected 'modernEnhancer' to be a function.`)
  }

  function enhancer(createStore) {
    const length = createStore.length
    if (length !== 4) {
      throw new Error(
        `Expected 'createStore' to accept 4 arguments but it accepts ${length}.`
      )
    }

    return (reducer, preloadedState, classicEnhancer, modernEnhancers) => {
      validateModernEnhancers(modernEnhancers)

      return createStore(
        reducer,
        preloadedState,
        classicEnhancer,
        (modernEnhancers || []).concat(modernEnhancer)
      )
    }
  }

  enhancer.modern = modernEnhancer
  return enhancer
}

// Since most store enhancers have a factory function, this adapter function is
// provided as a convenience. See `applyMiddleware` as an example.
export function adaptEnhancerCreator(createModernEnhancer) {
  if (typeof createModernEnhancer !== 'function') {
    throw new Error(`Expected 'createModernEnhancer' to be a function.`)
  }

  return (...args) => adaptEnhancer(createModernEnhancer(...args))
}
