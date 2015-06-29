/**
 * Given an object, returns a new object with the same keys
 * and values filtered by the result of the `iteratee` function.
 *
 * @param  {Object} obj
 * @param  {Function} fn - invoked to determine whether to discard
 * the property or not
 * @return {Object}
 */
export default function pick(obj, fn) {
  return Object.keys(obj).reduce((result, key) => {
    if (fn(obj[key])) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}
