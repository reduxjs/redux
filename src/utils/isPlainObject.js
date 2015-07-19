/* @flow */

export default function isPlainObject(obj: Object): boolean {
  if (!obj) {
    return false;
  }

  return typeof obj === 'object' &&
         Object.getPrototypeOf(obj) === Object.prototype;
}
