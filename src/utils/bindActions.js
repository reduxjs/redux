import mapValues from 'lodash/object/mapValues';

export default function bindActions(actionCreators, dispatcher) {
  return mapValues(actionCreators, actionCreator =>
    (...args) => dispatcher.perform(actionCreator, ...args)
  );
}
