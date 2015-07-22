import mapValues from '../utils/mapValues';

export default function bindActionCreators(actionCreators, dispatch) {
  return mapValues(actionCreators, actionCreator =>
    (...args) => dispatch(actionCreator(...args))
  );
}
