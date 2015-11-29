/**
 * Applies a function to every key-value pair inside an object.
 *
 * @param {Object} obj The source object.
 * @param {Function} fn The mapper function that receives the value and the key.
 * @returns {Object} A new object that contains the mapped values for the keys,
 * or the input object if no modifications were performed
 */
export default function mapValues(obj, fn,toto) {
  var hasChanged = false
  var result = Object.keys(obj).reduce((result, key) => {
    var mappedValue = fn(obj[key], key)
    hasChanged = hasChanged || ( mappedValue !== obj[key] )
    result[key] = mappedValue
    return result
  }, {})
  return hasChanged ? result : obj;
}
