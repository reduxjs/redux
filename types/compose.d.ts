declare type Func0<R> = () => R;
declare type Func1<T1, R> = (a1: T1) => R;
declare type Func2<T1, T2, R> = (a1: T1, a2: T2) => R;
declare type Func3<T1, T2, T3, R> = (a1: T1, a2: T2, a3: T3, ...args: any[]) => R;
/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for the
 * resulting composite function.
 *
 * @param funcs The functions to compose.
 * @returns R function obtained by composing the argument functions from right
 *   to left. For example, `compose(f, g, h)` is identical to doing
 *   `(...args) => f(g(h(...args)))`.
 */
export default function compose(): <R>(a: R) => R;
export default function compose<F extends Function>(f: F): F;
export default function compose<A, R>(f1: (b: A) => R, f2: Func0<A>): Func0<R>;
export default function compose<A, T1, R>(f1: (b: A) => R, f2: Func1<T1, A>): Func1<T1, R>;
export default function compose<A, T1, T2, R>(f1: (b: A) => R, f2: Func2<T1, T2, A>): Func2<T1, T2, R>;
export default function compose<A, T1, T2, T3, R>(f1: (b: A) => R, f2: Func3<T1, T2, T3, A>): Func3<T1, T2, T3, R>;
export default function compose<A, B, R>(f1: (b: B) => R, f2: (a: A) => B, f3: Func0<A>): Func0<R>;
export default function compose<A, B, T1, R>(f1: (b: B) => R, f2: (a: A) => B, f3: Func1<T1, A>): Func1<T1, R>;
export default function compose<A, B, T1, T2, R>(f1: (b: B) => R, f2: (a: A) => B, f3: Func2<T1, T2, A>): Func2<T1, T2, R>;
export default function compose<A, B, T1, T2, T3, R>(f1: (b: B) => R, f2: (a: A) => B, f3: Func3<T1, T2, T3, A>): Func3<T1, T2, T3, R>;
export default function compose<A, B, C, R>(f1: (b: C) => R, f2: (a: B) => C, f3: (a: A) => B, f4: Func0<A>): Func0<R>;
export default function compose<A, B, C, T1, R>(f1: (b: C) => R, f2: (a: B) => C, f3: (a: A) => B, f4: Func1<T1, A>): Func1<T1, R>;
export default function compose<A, B, C, T1, T2, R>(f1: (b: C) => R, f2: (a: B) => C, f3: (a: A) => B, f4: Func2<T1, T2, A>): Func2<T1, T2, R>;
export default function compose<A, B, C, T1, T2, T3, R>(f1: (b: C) => R, f2: (a: B) => C, f3: (a: A) => B, f4: Func3<T1, T2, T3, A>): Func3<T1, T2, T3, R>;
export default function compose<R>(f1: (b: any) => R, ...funcs: Function[]): (...args: any[]) => R;
export default function compose<R>(...funcs: Function[]): (...args: any[]) => R;
export {};
//# sourceMappingURL=compose.d.ts.map