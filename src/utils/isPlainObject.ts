/**
 * @param obj The object to inspect.
 * @returns True if the argument appears to be a plain object.
 */
export default function isPlainObject(obj: any): boolean {
  if (!obj) return false

  const proto = Object.getPrototypeOf(obj)

  return (
    proto === null ||
    (Object.getPrototypeOf(proto) === null &&
    proto.constructor === obj.constructor)
  )
}
