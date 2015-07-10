/* @flow */

export default function createStoreShape(PropTypes: Object): Object {
  return PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired
  });
}
