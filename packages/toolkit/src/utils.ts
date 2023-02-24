import createNextState, { isDraftable } from 'immer'
import type { Middleware, StoreEnhancer } from 'redux'

export function getTimeMeasureUtils(maxDelay: number, fnName: string) {
  let elapsed = 0
  return {
    measureTime<T>(fn: () => T): T {
      const started = Date.now()
      try {
        return fn()
      } finally {
        const finished = Date.now()
        elapsed += finished - started
      }
    },
    warnIfExceeded() {
      if (elapsed > maxDelay) {
        console.warn(`${fnName} took ${elapsed}ms, which is more than the warning threshold of ${maxDelay}ms. 
If your state or actions are very large, you may want to disable the middleware as it might cause too much of a slowdown in development mode. See https://redux-toolkit.js.org/api/getDefaultMiddleware for instructions.
It is disabled in production builds, so you don't need to worry about that.`)
      }
    },
  }
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * @public
 */
export class MiddlewareArray<
  Middlewares extends Middleware<any, any>[]
> extends Array<Middlewares[number]> {
  constructor(...items: Middlewares)
  constructor(...args: any[]) {
    super(...args)
    Object.setPrototypeOf(this, MiddlewareArray.prototype)
  }

  static get [Symbol.species]() {
    return MiddlewareArray as any
  }

  concat<AdditionalMiddlewares extends ReadonlyArray<Middleware<any, any>>>(
    items: AdditionalMiddlewares
  ): MiddlewareArray<[...Middlewares, ...AdditionalMiddlewares]>

  concat<AdditionalMiddlewares extends ReadonlyArray<Middleware<any, any>>>(
    ...items: AdditionalMiddlewares
  ): MiddlewareArray<[...Middlewares, ...AdditionalMiddlewares]>
  concat(...arr: any[]) {
    return super.concat.apply(this, arr)
  }

  prepend<AdditionalMiddlewares extends ReadonlyArray<Middleware<any, any>>>(
    items: AdditionalMiddlewares
  ): MiddlewareArray<[...AdditionalMiddlewares, ...Middlewares]>

  prepend<AdditionalMiddlewares extends ReadonlyArray<Middleware<any, any>>>(
    ...items: AdditionalMiddlewares
  ): MiddlewareArray<[...AdditionalMiddlewares, ...Middlewares]>

  prepend(...arr: any[]) {
    if (arr.length === 1 && Array.isArray(arr[0])) {
      return new MiddlewareArray(...arr[0].concat(this))
    }
    return new MiddlewareArray(...arr.concat(this))
  }
}

/**
 * @public
 */
export class EnhancerArray<
  Enhancers extends StoreEnhancer<any, any>[]
> extends Array<Enhancers[number]> {
  constructor(...items: Enhancers)
  constructor(...args: any[]) {
    super(...args)
    Object.setPrototypeOf(this, EnhancerArray.prototype)
  }

  static get [Symbol.species]() {
    return EnhancerArray as any
  }

  concat<AdditionalEnhancers extends ReadonlyArray<StoreEnhancer<any, any>>>(
    items: AdditionalEnhancers
  ): EnhancerArray<[...Enhancers, ...AdditionalEnhancers]>

  concat<AdditionalEnhancers extends ReadonlyArray<StoreEnhancer<any, any>>>(
    ...items: AdditionalEnhancers
  ): EnhancerArray<[...Enhancers, ...AdditionalEnhancers]>
  concat(...arr: any[]) {
    return super.concat.apply(this, arr)
  }

  prepend<AdditionalEnhancers extends ReadonlyArray<StoreEnhancer<any, any>>>(
    items: AdditionalEnhancers
  ): EnhancerArray<[...AdditionalEnhancers, ...Enhancers]>

  prepend<AdditionalEnhancers extends ReadonlyArray<StoreEnhancer<any, any>>>(
    ...items: AdditionalEnhancers
  ): EnhancerArray<[...AdditionalEnhancers, ...Enhancers]>

  prepend(...arr: any[]) {
    if (arr.length === 1 && Array.isArray(arr[0])) {
      return new EnhancerArray(...arr[0].concat(this))
    }
    return new EnhancerArray(...arr.concat(this))
  }
}

export function freezeDraftable<T>(val: T) {
  return isDraftable(val) ? createNextState(val, () => {}) : val
}
