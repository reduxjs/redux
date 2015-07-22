export default function isPlainObject(obj) {
  if (!obj) {
    return false;
  }

  return typeof obj === 'object' &&
         Object.getPrototypeOf(obj) === Object.prototype;
}
