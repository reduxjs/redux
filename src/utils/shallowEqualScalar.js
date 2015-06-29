/**
 * Given two objects, performs equality by iterating through keys
 * on an object and returning `false` when any key has values which
 * are not strictly equal between `objA` and `objB`.
 * Returns `true` when the values of all keys are strictly equal.
 *
 * NOTE: if value is an `Object`, returns `false`. This allows the check
 * to be more performant.
 *
 * @param  {Object} objA
 * @param  {Object} objB
 * @return {Boolean}
 */
export default function shallowEqualScalar(objA, objB) {
  if (objA === objB) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  const hasOwn = Object.prototype.hasOwnProperty;
  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i])) {
      return false;
    }

    const valA = objA[keysA[i]];
    const valB = objB[keysA[i]];

    if (valA !== valB || typeof valA === 'object' || typeof valB === 'object') {
      return false;
    }
  }

  return true;
}
