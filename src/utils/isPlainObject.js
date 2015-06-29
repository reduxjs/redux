/**
 * Given an object, checks that it's a plain object. That is, an object
 * created by the `Object` constructor or one with a `Prototype` of `null`.
 *
 * @param  {*} obj - the value to check
 * @return {Boolean} `true` if it's a plain object, else `false`
 */
export default function isPlainObject(obj) {
  return obj ? typeof obj === 'object'
    && Object.getPrototypeOf(obj) === Object.prototype : false;
}
