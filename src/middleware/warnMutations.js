import invariant from 'invariant';
import cloneDeep from 'lodash.clonedeep';

const hasOwn = Object.prototype.hasOwnProperty;

function any(collection, predicate) {
  for (let key in collection) {
    if (hasOwn.call(collection, key)) {
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
  return cloneDeep(state, value => {
    if (isImmutable(value)) {
      return value;
    }
  });
}

function wasMutated(prevStateRef, prevState, state, isImmutable, sameParentRef = true) {
  if (isImmutable(prevState)) {
    if (sameParentRef) {
      return prevState !== state;
    }

    return false;
  }

  const sameRef = prevStateRef === state;

  return any(prevStateRef, (val, key) =>
    wasMutated(val, prevState[key], state[key], isImmutable, sameRef)
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
  let lastStateCopy = copyState(lastStateRef, isImmutable);

  return (next) => (action) => {
    const stateRef = getState();

    invariant(
      !wasMutated(lastStateRef, lastStateCopy, stateRef, isImmutable),
      BETWEEN_DISPATCHES_MESSAGE
    );

    const stateCopy = copyState(stateRef, isImmutable);
    const dispatchedAction = next(action);
    lastStateRef = getState();

    invariant(
      !wasMutated(stateRef, stateCopy, lastStateRef, isImmutable),
      INSIDE_DISPATCH_MESSAGE,
      action.type
    );

    lastStateCopy = copyState(lastStateRef, isImmutable);
    return dispatchedAction;
  };
}
