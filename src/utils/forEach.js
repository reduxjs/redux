/**
 * Iterate each item of an array
 *
 * @param {Array} list The array to iterate.
 * @param {Function} fn The function to call in each array index.
 * @returns {void}
 */
export default function forEach(list, fn) {
  var len = list.length
  var i = 0
  for (i; i < len; i++) {
    fn(list[i], i)
  }
}
