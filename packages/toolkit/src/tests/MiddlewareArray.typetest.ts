import { getDefaultMiddleware, configureStore } from '@reduxjs/toolkit'
import type { Middleware } from 'redux'

declare const expectType: <T>(t: T) => T

declare const middleware1: Middleware<{
  (_: string): number
}>

declare const middleware2: Middleware<{
  (_: number): string
}>

type ThunkReturn = Promise<'thunk'>
declare const thunkCreator: () => () => ThunkReturn

{
  // prepend single element
  {
    const store = configureStore({
      reducer: () => 0,
      middleware: (gDM) => gDM().prepend(middleware1),
    })
    expectType<number>(store.dispatch('foo'))
    expectType<ThunkReturn>(store.dispatch(thunkCreator()))

    // @ts-expect-error
    expectType<string>(store.dispatch('foo'))
  }

  // prepend multiple (rest)
  {
    const store = configureStore({
      reducer: () => 0,
      middleware: (gDM) => gDM().prepend(middleware1, middleware2),
    })
    expectType<number>(store.dispatch('foo'))
    expectType<string>(store.dispatch(5))
    expectType<ThunkReturn>(store.dispatch(thunkCreator()))

    // @ts-expect-error
    expectType<string>(store.dispatch('foo'))
  }

  // prepend multiple (array notation)
  {
    const store = configureStore({
      reducer: () => 0,
      middleware: (gDM) => gDM().prepend([middleware1, middleware2] as const),
    })

    expectType<number>(store.dispatch('foo'))
    expectType<string>(store.dispatch(5))
    expectType<ThunkReturn>(store.dispatch(thunkCreator()))

    // @ts-expect-error
    expectType<string>(store.dispatch('foo'))
  }

  // concat single element
  {
    const store = configureStore({
      reducer: () => 0,
      middleware: (gDM) => gDM().concat(middleware1),
    })

    expectType<number>(store.dispatch('foo'))
    expectType<ThunkReturn>(store.dispatch(thunkCreator()))

    // @ts-expect-error
    expectType<string>(store.dispatch('foo'))
  }

  // prepend multiple (rest)
  {
    const store = configureStore({
      reducer: () => 0,
      middleware: (gDM) => gDM().concat(middleware1, middleware2),
    })

    expectType<number>(store.dispatch('foo'))
    expectType<string>(store.dispatch(5))
    expectType<ThunkReturn>(store.dispatch(thunkCreator()))

    // @ts-expect-error
    expectType<string>(store.dispatch('foo'))
  }

  // concat multiple (array notation)
  {
    const store = configureStore({
      reducer: () => 0,
      middleware: (gDM) => gDM().concat([middleware1, middleware2] as const),
    })

    expectType<number>(store.dispatch('foo'))
    expectType<string>(store.dispatch(5))
    expectType<ThunkReturn>(store.dispatch(thunkCreator()))

    // @ts-expect-error
    expectType<string>(store.dispatch('foo'))
  }

  // concat and prepend
  {
    const store = configureStore({
      reducer: () => 0,
      middleware: (gDM) => gDM().concat(middleware1).prepend(middleware2),
    })

    expectType<number>(store.dispatch('foo'))
    expectType<string>(store.dispatch(5))
    expectType<ThunkReturn>(store.dispatch(thunkCreator()))

    // @ts-expect-error
    expectType<string>(store.dispatch('foo'))
  }
}
