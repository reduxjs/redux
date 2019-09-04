import { F, T } from 'ts-toolbelt'

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for the
 * resulting composite function.
 *
 * @param funcs The functions to compose.
 * @returns A function obtained by composing the argument functions from right
 *   to left. For example, `compose(f, g, h)` is identical to doing
 *   `(...args) => f(g(h(...args)))`.
 */
const compose = <Fns extends F.Function<any[], any>[]>(
  ...funcs: Fns
): ((
  ...args: Parameters<Fns[T.Tail<Fns>['length']]>
) => F.Return<T.Head<Fns>>) => {
  if (funcs.length === 0) {
    // infer the argument type so it is usable in inference down the line
    // TODO: should probably throw an error here instead
    return (<T>(arg: T) => arg) as any
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args: any) => a(b(...args)))
}

export default compose
