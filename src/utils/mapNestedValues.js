import traverse from 'traverse'
/**
 * Applies a function to every key-value pair inside an object.
 *
 * @param {Object} obj The source object.
 * @param {Function} fn The mapper function that receives the value and the key.
 * @returns {Object} A new object that contains the mapped values for the keys.
 */
export default function mapNestedValues(obj, fn) {
  return traverse(obj).map( function (node) {
    if (this.isLeaf) {
      if (typeof node === 'function') {
        this.update(fn(node, this.key))
      } else {
        this.remove()
      }
    }
  })
}
