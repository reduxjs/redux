import type { AnyAction, Middleware, ThunkAction } from '@reduxjs/toolkit'
import {
  getDefaultMiddleware,
  MiddlewareArray,
  configureStore,
} from '@reduxjs/toolkit'
import thunk from 'redux-thunk'

describe('getDefaultMiddleware', () => {
  const ORIGINAL_NODE_ENV = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = ORIGINAL_NODE_ENV
  })

  it('returns an array with only redux-thunk in production', () => {
    process.env.NODE_ENV = 'production'

    expect(getDefaultMiddleware()).toEqual([thunk]) // @remap-prod-remove-line
  })

  it('returns an array with additional middleware in development', () => {
    const middleware = getDefaultMiddleware()
    expect(middleware).toContain(thunk)
    expect(middleware.length).toBeGreaterThan(1)
  })

  it('removes the thunk middleware if disabled', () => {
    const middleware = getDefaultMiddleware({ thunk: false })
    expect(middleware.includes(thunk)).toBe(false)
    expect(middleware.length).toBe(2)
  })

  it('removes the immutable middleware if disabled', () => {
    const defaultMiddleware = getDefaultMiddleware()
    const middleware = getDefaultMiddleware({ immutableCheck: false })
    expect(middleware.length).toBe(defaultMiddleware.length - 1)
  })

  it('removes the serializable middleware if disabled', () => {
    const defaultMiddleware = getDefaultMiddleware()
    const middleware = getDefaultMiddleware({ serializableCheck: false })
    expect(middleware.length).toBe(defaultMiddleware.length - 1)
  })

  it('allows passing options to thunk', () => {
    const extraArgument = 42
    const middleware = getDefaultMiddleware({
      thunk: { extraArgument },
      immutableCheck: false,
      serializableCheck: false,
    })

    const testThunk: ThunkAction<void, {}, number, AnyAction> = (
      dispatch,
      getState,
      extraArg
    ) => {
      expect(extraArg).toBe(extraArgument)
    }

    const reducer = () => ({})

    const store = configureStore({
      reducer,
      middleware,
    })

    store.dispatch(testThunk)
  })

  it('allows passing options to immutableCheck', () => {
    let immutableCheckWasCalled = false

    const middleware = getDefaultMiddleware({
      thunk: false,
      immutableCheck: {
        isImmutable: () => {
          immutableCheckWasCalled = true
          return true
        },
      },
      serializableCheck: false,
    })

    const reducer = () => ({})

    const store = configureStore({
      reducer,
      middleware,
    })

    expect(immutableCheckWasCalled).toBe(true)
  })

  it('allows passing options to serializableCheck', () => {
    let serializableCheckWasCalled = false

    const middleware = getDefaultMiddleware({
      thunk: false,
      immutableCheck: false,
      serializableCheck: {
        isSerializable: () => {
          serializableCheckWasCalled = true
          return true
        },
      },
    })

    const reducer = () => ({})

    const store = configureStore({
      reducer,
      middleware,
    })

    store.dispatch({ type: 'TEST_ACTION' })

    expect(serializableCheckWasCalled).toBe(true)
  })
})

describe('MiddlewareArray functionality', () => {
  const middleware1: Middleware = () => (next) => (action) => next(action)
  const middleware2: Middleware = () => (next) => (action) => next(action)
  const defaultMiddleware = getDefaultMiddleware()
  const originalDefaultMiddleware = [...defaultMiddleware]

  test('allows to prepend a single value', () => {
    const prepended = defaultMiddleware.prepend(middleware1)

    // value is prepended
    expect(prepended).toEqual([middleware1, ...defaultMiddleware])
    // returned value is of correct type
    expect(prepended).toBeInstanceOf(MiddlewareArray)
    // prepended is a new array
    expect(prepended).not.toEqual(defaultMiddleware)
    // defaultMiddleware is not modified
    expect(defaultMiddleware).toEqual(originalDefaultMiddleware)
  })

  test('allows to prepend multiple values (array as first argument)', () => {
    const prepended = defaultMiddleware.prepend([middleware1, middleware2])

    // value is prepended
    expect(prepended).toEqual([middleware1, middleware2, ...defaultMiddleware])
    // returned value is of correct type
    expect(prepended).toBeInstanceOf(MiddlewareArray)
    // prepended is a new array
    expect(prepended).not.toEqual(defaultMiddleware)
    // defaultMiddleware is not modified
    expect(defaultMiddleware).toEqual(originalDefaultMiddleware)
  })

  test('allows to prepend multiple values (rest)', () => {
    const prepended = defaultMiddleware.prepend(middleware1, middleware2)

    // value is prepended
    expect(prepended).toEqual([middleware1, middleware2, ...defaultMiddleware])
    // returned value is of correct type
    expect(prepended).toBeInstanceOf(MiddlewareArray)
    // prepended is a new array
    expect(prepended).not.toEqual(defaultMiddleware)
    // defaultMiddleware is not modified
    expect(defaultMiddleware).toEqual(originalDefaultMiddleware)
  })

  test('allows to concat a single value', () => {
    const concatenated = defaultMiddleware.concat(middleware1)

    // value is concatenated
    expect(concatenated).toEqual([...defaultMiddleware, middleware1])
    // returned value is of correct type
    expect(concatenated).toBeInstanceOf(MiddlewareArray)
    // concatenated is a new array
    expect(concatenated).not.toEqual(defaultMiddleware)
    // defaultMiddleware is not modified
    expect(defaultMiddleware).toEqual(originalDefaultMiddleware)
  })

  test('allows to concat multiple values (array as first argument)', () => {
    const concatenated = defaultMiddleware.concat([middleware1, middleware2])

    // value is concatenated
    expect(concatenated).toEqual([
      ...defaultMiddleware,
      middleware1,
      middleware2,
    ])
    // returned value is of correct type
    expect(concatenated).toBeInstanceOf(MiddlewareArray)
    // concatenated is a new array
    expect(concatenated).not.toEqual(defaultMiddleware)
    // defaultMiddleware is not modified
    expect(defaultMiddleware).toEqual(originalDefaultMiddleware)
  })

  test('allows to concat multiple values (rest)', () => {
    const concatenated = defaultMiddleware.concat(middleware1, middleware2)

    // value is concatenated
    expect(concatenated).toEqual([
      ...defaultMiddleware,
      middleware1,
      middleware2,
    ])
    // returned value is of correct type
    expect(concatenated).toBeInstanceOf(MiddlewareArray)
    // concatenated is a new array
    expect(concatenated).not.toEqual(defaultMiddleware)
    // defaultMiddleware is not modified
    expect(defaultMiddleware).toEqual(originalDefaultMiddleware)
  })

  test('allows to concat and then prepend', () => {
    const concatenated = defaultMiddleware
      .concat(middleware1)
      .prepend(middleware2)

    expect(concatenated).toEqual([
      middleware2,
      ...defaultMiddleware,
      middleware1,
    ])
  })

  test('allows to prepend and then concat', () => {
    const concatenated = defaultMiddleware
      .prepend(middleware2)
      .concat(middleware1)

    expect(concatenated).toEqual([
      middleware2,
      ...defaultMiddleware,
      middleware1,
    ])
  })
})
