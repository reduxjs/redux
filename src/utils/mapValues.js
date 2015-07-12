/* @flow */

export default function mapValues(obj: Object, fn: Function): Object {
  return Object.keys(obj).reduce((result, key) => {
    result[key] = fn(obj[key], key);
    return result;
  }, {});
}
