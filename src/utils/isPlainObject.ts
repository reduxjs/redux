/**
 * @param obj The object to inspect.
 * @returns True if the argument appears to be a plain object.
 */
export default function isPlainObject(obj: any): boolean {
  if (!obj) return false

  const proto = obj.__proto__
  return !proto || !Object.getPrototypeOf(proto)
}
