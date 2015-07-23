import mapValues from '../utils/mapValues';

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * @param {Object} actionCreators An object whose values are action creator
 * functions. One handy way to obtain it is to use ES6 `import * as` syntax.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Object} The object mimicking the original object, but with every
 * action creator wrapped into the `dispatch` call.
 */
export default function bindActionCreators(actionCreators, dispatch) {
  return mapValues(actionCreators, actionCreator =>
    (...args) => dispatch(actionCreator(...args))
  );
}
