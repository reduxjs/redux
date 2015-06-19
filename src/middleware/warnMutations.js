import invariant from 'invariant';

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

const BETWEEN_DISPATCHES_MESSAGE = [
  'A state mutation was detected between dispatches.',
  ' This may cause incorrect behavior.',
  '(https://github.com/gaearon/redux#my-views-arent-updating)'
].join('');

const INSIDE_DISPATCH_MESSAGE = [
  'A state mutation was detected inside a dispatch.',
  ' Take a look at the store(s) handling the action %s.',
  '(https://github.com/gaearon/redux#my-views-arent-updating)'
].join('');

export default function warnMutationsMiddleware(getState) {
  let lastStateRef = getState();
  let lastState = copyState(lastStateRef);

  return (next) => (action) => {
    const stateRef = getState();
    const state = copyState(stateRef);

    invariant(
      !wasMutated(lastStateRef, lastState, stateRef, state),
      BETWEEN_DISPATCHES_MESSAGE
    );

    const dispatchedAction = next(action);

    lastStateRef = getState();
    lastState = copyState(lastStateRef);

    invariant(
      !wasMutated(stateRef, state, lastStateRef, lastState),
      INSIDE_DISPATCH_MESSAGE,
      action.type
    );

    return dispatchedAction;
  };
}
