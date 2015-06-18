export default function isPlainObject(obj) {
  return typeof obj == 'object' && Object.getPrototypeOf(obj) === Object.prototype;
}
