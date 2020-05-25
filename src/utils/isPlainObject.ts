/**
 * @param obj The object to inspect.
 * @returns True if the argument appears to be a plain object.
 */
export default function isPlainObject(obj: any): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.getPrototypeOf(Object.getPrototypeOf(value) || {}) === null
  )
}
