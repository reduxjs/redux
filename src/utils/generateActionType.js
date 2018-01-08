export function generateActionType(prefix) {
  return prefix + Math.random()
    .toString(36)
    .substring(7)
    .split('')
    .join('.')
}
