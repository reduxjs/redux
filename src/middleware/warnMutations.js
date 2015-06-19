import invariant from 'invariant';
import isPlainObject from '../utils/isPlainObject';

function any(collection, predicate) {
  for (let key in collection) {
    if (collection.hasOwnProperty(key)) {
      if (predicate(collection[key], key)) {
        return true;
      }
    }
  }
  return false;
}

// Based on https://github.com/facebook/immutable-js/issues/421#issuecomment-87089399
function isImmutableDefault(value) {
  return typeof value !== 'object' ||
    (typeof value.equals === 'function' && typeof value.hashCode === 'function');
}

function copyState(state, isImmutable) {
  if (!state) { return state; }

  if (isImmutable(state)) {
    return state;
  }

  if (!Array.isArray(state) && !isPlainObject(state)) {
    return state;
  }

  const keysAndValues = [];

  for (let key in state) {
    if (state.hasOwnProperty(key)) {
      keysAndValues.push([key, copyState(state[key], isImmutable)]);
    }
  }

  const initialObj = Array.isArray(state) ? [] : {};

  return keysAndValues.reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, initialObj);
}

function wasMutated(prevStateRef, prevState, stateRef, state, isImmutable, sameParentRef = true) {
  if (isImmutable(prevState)) {
    if (sameParentRef) {
      return prevState !== state;
    }

    return false;
  }

  return any(prevStateRef, (val, key) =>
    wasMutated(
      val, prevState[key], stateRef[key], state[key],
      isImmutable, prevStateRef === stateRef
    )
  );
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

export default function warnMutationsMiddleware(getState, isImmutable = isImmutableDefault) {
  let lastStateRef = getState();
  let lastState = copyState(lastStateRef, isImmutable);

  return (next) => (action) => {
    const stateRef = getState();
    const state = copyState(stateRef, isImmutable);

    invariant(
      !wasMutated(lastStateRef, lastState, stateRef, state, isImmutable),
      BETWEEN_DISPATCHES_MESSAGE
    );

    const dispatchedAction = next(action);

    lastStateRef = getState();
    lastState = copyState(lastStateRef, isImmutable);

    invariant(
      !wasMutated(stateRef, state, lastStateRef, lastState, isImmutable),
      INSIDE_DISPATCH_MESSAGE,
      action.type
    );

    return dispatchedAction;
  };
}
