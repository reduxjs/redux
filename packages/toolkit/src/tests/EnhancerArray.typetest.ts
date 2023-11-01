import { configureStore } from '@reduxjs/toolkit'
import type { StoreEnhancer } from 'redux'

declare const expectType: <T>(t: T) => T

declare const enhancer1: StoreEnhancer<
  {
    has1: true
  },
  { stateHas1: true }
>

declare const enhancer2: StoreEnhancer<
  {
    has2: true
  },
  { stateHas2: true }
>

{
  // prepend single element
  {
    const store = configureStore({
      reducer: () => 0,
      enhancers: (dE) => dE.prepend(enhancer1),
    })
    expectType<true>(store.has1)
    expectType<true>(store.getState().stateHas1)

    // @ts-expect-error
    expectType<true>(store.has2)
    // @ts-expect-error
    expectType<true>(store.getState().stateHas2)
  }

  // prepend multiple (rest)
  {
    const store = configureStore({
      reducer: () => 0,
      enhancers: (dE) => dE.prepend(enhancer1, enhancer2),
    })
    expectType<true>(store.has1)
    expectType<true>(store.getState().stateHas1)
    expectType<true>(store.has2)
    expectType<true>(store.getState().stateHas2)

    // @ts-expect-error
    expectType<true>(store.has3)
    // @ts-expect-error
    expectType<true>(store.getState().stateHas3)
  }

  // prepend multiple (array notation)
  {
    const store = configureStore({
      reducer: () => 0,
      enhancers: (dE) => dE.prepend([enhancer1, enhancer2] as const),
    })
    expectType<true>(store.has1)
    expectType<true>(store.getState().stateHas1)
    expectType<true>(store.has2)
    expectType<true>(store.getState().stateHas2)

    // @ts-expect-error
    expectType<true>(store.has3)
    // @ts-expect-error
    expectType<true>(store.getState().stateHas3)
  }

  // concat single element
  {
    const store = configureStore({
      reducer: () => 0,
      enhancers: (dE) => dE.concat(enhancer1),
    })
    expectType<true>(store.has1)
    expectType<true>(store.getState().stateHas1)

    // @ts-expect-error
    expectType<true>(store.has2)
    // @ts-expect-error
    expectType<true>(store.getState().stateHas2)
  }

  // prepend multiple (rest)
  {
    const store = configureStore({
      reducer: () => 0,
      enhancers: (dE) => dE.concat(enhancer1, enhancer2),
    })
    expectType<true>(store.has1)
    expectType<true>(store.getState().stateHas1)
    expectType<true>(store.has2)
    expectType<true>(store.getState().stateHas2)

    // @ts-expect-error
    expectType<true>(store.has3)
    // @ts-expect-error
    expectType<true>(store.getState().stateHas3)
  }

  // concat multiple (array notation)
  {
    const store = configureStore({
      reducer: () => 0,
      enhancers: (dE) => dE.concat([enhancer1, enhancer2] as const),
    })
    expectType<true>(store.has1)
    expectType<true>(store.getState().stateHas1)
    expectType<true>(store.has2)
    expectType<true>(store.getState().stateHas2)

    // @ts-expect-error
    expectType<true>(store.has3)
    // @ts-expect-error
    expectType<true>(store.getState().stateHas3)
  }

  // concat and prepend
  {
    const store = configureStore({
      reducer: () => 0,
      enhancers: (dE) => dE.concat(enhancer1).prepend(enhancer2),
    })
    expectType<true>(store.has1)
    expectType<true>(store.getState().stateHas1)
    expectType<true>(store.has2)
    expectType<true>(store.getState().stateHas2)

    // @ts-expect-error
    expectType<true>(store.has3)
    // @ts-expect-error
    expectType<true>(store.getState().stateHas3)
  }
}
