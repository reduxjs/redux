/* @flow */

export default function isPlainObject(obj: Object): boolean {
  return obj ? typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype : false;
}
