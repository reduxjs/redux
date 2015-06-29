import mapValues from '../utils/mapValues';

/**
 * Given a list action creators, wrap them to the `dispatch` function
 * in order to be automatically dispatched when invoked.
 *
 * @param  {Object} actionCreators - an object with the action functions
 * @param  {Function} dispatch
 * @return {Object} the given object with wrapped actions
 */
export default function bindActionCreators(actionCreators, dispatch) {
  return mapValues(actionCreators, actionCreator =>
    (...args) => dispatch(actionCreator(...args))
  );
}
