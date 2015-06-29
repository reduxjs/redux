/**
 * Given two objects, performs equality by iterating through keys
 * on an object and returning `false` when any key has values which
 * are not strictly equal between `objA` and `objB`.
 * Returns `true` when the values of all keys are strictly equal.
 *
 * @param  {Object} objA
 * @param  {Object} objB
 * @return {Boolean}
 */
export default function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  const hasOwn = Object.prototype.hasOwnProperty;
  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i]) ||
        objA[keysA[i]] !== objB[keysA[i]]) {
      return false;
    }
  }

  return true;
}
