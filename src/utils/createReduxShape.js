/**
 * Define the shape of the `redux` prop, used for props validation.
 *
 * @param  {Object} PropTypes
 * @return {Object}
 */
export default function createReduxShape(PropTypes) {
  return PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired
  });
}
