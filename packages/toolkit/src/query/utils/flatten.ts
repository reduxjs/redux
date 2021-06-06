/**
 * Alternative to `Array.flat(1)`
 * @param arr An array like [1,2,3,[1,2]]
 * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
 */
export const flatten = (arr: readonly any[]) => [].concat(...arr)
