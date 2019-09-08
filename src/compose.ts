/**
 * A generic representation of a function exposing more type information than
 * the built-in `Function` type, allowing extraction of its input param types
 */
interface Fn extends Function {
  <A extends unknown[]>(...args: A): unknown
  <A>(...args: A[]): unknown
}

/**
 * A type-level utility function to
 */
type Tail<Fns extends Fn[]> = Fns extends <A>(
  a: A,
  ...rest: infer Rest
) => unknown
  ? Rest
  : never

/**
 * A type-level utility function to
 */
type Last<Fns extends Fn[]> = Fns[Tail<Fns>['length']]

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
// when given no args and no generic type params, infer args as tuple
export default function compose(): <A extends unknown[]>(...a: A) => A[0]
// allow specifying type param of args tuple
export default function compose<A extends unknown[]>(): (...a: A) => A[0]
// when given a single function, just return that function
export default function compose<A extends unknown[], B>(
  fab: (...args: A) => B
): (...args: A) => B
// standard case, given 2 functions
export default function compose<A extends unknown[], B, C>(
  fbc: (b: B) => C,
  fab: (...args: A) => B
): (...args: A) => C
// standard case, given 3 functions
export default function compose<A extends unknown[], B, C, D>(
  fcd: (c: C) => D,
  fbc: (b: B) => C,
  fab: (...args: A) => B
): (...args: A) => D
// standard case, given 4 functions
export default function compose<A extends unknown[], B, C, D, E>(
  fde: (d: D) => E,
  fcd: (c: C) => D,
  fbc: (b: B) => C,
  fab: (...args: A) => B
): (...args: A) => E
// standard case, given 5 functions
export default function compose<A extends unknown[], B, C, D, E, F>(
  fef: (e: E) => F,
  fde: (d: D) => E,
  fcd: (c: C) => D,
  fbc: (b: B) => C,
  fab: (...args: A) => B
): (...args: A) => F
// extra overloads allowing functions other than the right-most function
// to take in more than one argument, though the extra arguments go unused
// 2 multi-arg functions
export default function compose<A extends unknown[], B extends unknown[], C>(
  fbc: (...b: B) => C,
  fab: (...args: A) => B[0]
): (...args: A) => C
// 3 multi-arg functions
export default function compose<
  A extends unknown[],
  B extends unknown[],
  C extends unknown[],
  D
>(
  fcd: (...c: C) => D,
  fbc: (...b: B) => C[0],
  fab: (...args: A) => B[0]
): (...args: A) => D
// 4 multi-arg functions
export default function compose<
  A extends unknown[],
  B extends unknown[],
  C extends unknown[],
  D extends unknown[],
  E
>(
  fde: (...d: D) => E,
  fcd: (...c: C) => D[0],
  fbc: (...b: B) => C[0],
  fab: (...args: A) => B[0]
): (...args: A) => E
// 5 multi-arg functions
export default function compose<
  A extends unknown[],
  B extends unknown[],
  C extends unknown[],
  D extends unknown[],
  E extends unknown[],
  F
>(
  fef: (...e: E) => F,
  fde: (...d: D) => E[0],
  fcd: (...c: C) => D[0],
  fbc: (...b: B) => C[0],
  fab: (...args: A) => B[0]
): (...args: A) => F
// generic type signature for any number of functions
export default function compose<Fns extends Fn[]>(
  ...funcs: Fns
): (...args: Parameters<Last<Fns>>) => ReturnType<Fns[0]>
// generic base case type signature and function body implementation
export default function compose<Fns extends Fn[]>(...fns: Fns): Fn {
  const len = fns.length

  if (len === 0) {
    return <A extends unknown[]>(...args: A): A[0] => args[0]
  }

  if (len === 1) {
    return fns[0]
  }

  // `Parameters<typeof b>` is equalavelnt to `unknown[]` in the below type,
  // signature, but `Parameters<typeof b>` more clearly conveys intent
  return fns.reduce((a, b) => (...args: Parameters<typeof b>) => a(b(...args)))
}
