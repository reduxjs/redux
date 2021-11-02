export function removeUndefined<T>(t: T | undefined): t is T {
  return typeof t !== 'undefined';
}
