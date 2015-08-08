import invariant from 'invariant';
import mapValues from '../utils/mapValues';

function bindActionCreator(actionCreator, dispatch) {
  return (...args) => dispatch(actionCreator(...args));
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * @param {Object|Function} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. It also supports binding only a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Object} The object mimicking the original object, but with every
 * action creator wrapped into the `dispatch` call.
 */
export default function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  invariant(
    typeof actionCreators === 'object' && actionCreators != null,
    'bindActionCreators expected an object or a function, instead received %s. ' +
    'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?',
    typeof actionCreators
  );

  return mapValues(actionCreators, actionCreator =>
    bindActionCreator(actionCreator, dispatch)
  );
}

