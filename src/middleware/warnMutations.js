import isEqual from 'lodash/lang/isEqual';
import any from 'lodash/collection/any';
import cloneDeep from 'lodash/lang/cloneDeep';

function copyState(state) {
  return cloneDeep(state);
}

function wasMutated(prevStateRef, prevState, stateRef, state) {
  if (prevStateRef === stateRef && !isEqual(prevState, state)) {
    return true;
  }

  if (typeof prevStateRef !== 'object') {
    return false;
  }

  return any(prevStateRef, (val, key) =>
    wasMutated(val, prevState[key], stateRef[key], state[key]));
}

export default function warnMutationsMiddleware(getState) {
  let lastStateRef = getState();
  let lastState = copyState(lastStateRef);

  return (next) => (action) => {
    const stateRef = getState();
    const state = copyState(stateRef);

    if (wasMutated(lastStateRef, lastState, stateRef, state)) {
      console.warn([
        'A state mutation was detected between dispatches.' +
        ' This may cause incorrect behavior.',
        '(https://github.com/gaearon/redux#my-views-arent-updating)'
      ].join(''));
    };

    action = next(action);

    lastStateRef = getState();
    lastState = copyState(lastStateRef);

    if (wasMutated(stateRef, state, lastStateRef, lastState)) {
      console.warn(
        'A state mutation was detected inside a dispatch.',
        ` Take a look at the store(s) handling the action`,
        action,
        '(https://github.com/gaearon/redux#my-views-arent-updating)'
      );
    }

    return action;
  };
}
