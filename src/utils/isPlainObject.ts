/**
 * @param obj The object to inspect.
 * @returns True if the argument appears to be a plain object.
 */
export default function isPlainObject(obj: any): boolean {
  if (typeof obj !== 'object' || obj === null) return false

  const proto = Object.getPrototypeOf(obj)
  return Boolean(proto && !Object.getPrototypeOf(proto))
}
