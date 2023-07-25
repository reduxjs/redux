/**
 * @param obj The object to inspect.
 * @returns True if the argument appears to be a plain object.
 */
export default function isPlainObject(obj: any): boolean {
  if (typeof obj !== 'object' || obj === null) return false;

  const prototype = Object.getPrototypeOf(obj);
  return prototype === null || prototype === Object.prototype;
}
