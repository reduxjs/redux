import { getDefaultMiddleware } from '@reduxjs/toolkit'
import type { Middleware } from 'redux'
import type { DispatchForMiddlewares } from '@internal/tsHelpers'

declare const expectType: <T>(t: T) => T

declare const middleware1: Middleware<{
  (_: string): number
}>

declare const middleware2: Middleware<{
  (_: number): string
}>

declare const getDispatch: <M extends Array<Middleware>>(
  m: M
) => DispatchForMiddlewares<M>

type ThunkReturn = Promise<'thunk'>
declare const thunkCreator: () => () => ThunkReturn

{
  const defaultMiddleware = getDefaultMiddleware()

  // prepend single element
  {
    const concatenated = defaultMiddleware.prepend(middleware1)
    const dispatch = getDispatch(concatenated)
    expectType<number>(dispatch('foo'))
    expectType<ThunkReturn>(dispatch(thunkCreator()))

    // @ts-expect-error
    expectType<string>(dispatch('foo'))
  }

  // prepepend multiple (rest)
  {
    const concatenated = defaultMiddleware.prepend(middleware1, middleware2)
    const dispatch = getDispatch(concatenated)
    expectType<number>(dispatch('foo'))
    expectType<string>(dispatch(5))
    expectType<ThunkReturn>(dispatch(thunkCreator()))

    // @ts-expect-error
    expectType<string>(dispatch('foo'))
  }

  // prepend multiple (array notation)
  {
    const concatenated = defaultMiddleware.prepend([
      middleware1,
      middleware2,
    ] as const)
    const dispatch = getDispatch(concatenated)
    expectType<number>(dispatch('foo'))
    expectType<string>(dispatch(5))
    expectType<ThunkReturn>(dispatch(thunkCreator()))

    // @ts-expect-error
    expectType<string>(dispatch('foo'))
  }

  // concat single element
  {
    const concatenated = defaultMiddleware.concat(middleware1)
    const dispatch = getDispatch(concatenated)
    expectType<number>(dispatch('foo'))
    expectType<ThunkReturn>(dispatch(thunkCreator()))

    // @ts-expect-error
    expectType<string>(dispatch('foo'))
  }

  // prepepend multiple (rest)
  {
    const concatenated = defaultMiddleware.concat(middleware1, middleware2)
    const dispatch = getDispatch(concatenated)
    expectType<number>(dispatch('foo'))
    expectType<string>(dispatch(5))
    expectType<ThunkReturn>(dispatch(thunkCreator()))

    // @ts-expect-error
    expectType<string>(dispatch('foo'))
  }

  // concat multiple (array notation)
  {
    const concatenated = defaultMiddleware.concat([
      middleware1,
      middleware2,
    ] as const)
    const dispatch = getDispatch(concatenated)
    expectType<number>(dispatch('foo'))
    expectType<string>(dispatch(5))
    expectType<ThunkReturn>(dispatch(thunkCreator()))

    // @ts-expect-error
    expectType<string>(dispatch('foo'))
  }

  // concat and prepend
  {
    const concatenated = defaultMiddleware
      .concat(middleware1)
      .prepend(middleware2)
    const dispatch = getDispatch(concatenated)
    expectType<number>(dispatch('foo'))
    expectType<string>(dispatch(5))
    expectType<ThunkReturn>(dispatch(thunkCreator()))

    // @ts-expect-error
    expectType<string>(dispatch('foo'))
  }
}
