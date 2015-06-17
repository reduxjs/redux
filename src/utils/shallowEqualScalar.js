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
