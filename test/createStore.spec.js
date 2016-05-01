import expect from 'expect'
import { createSpy } from 'expect'
import { without } from 'lodash'
import { createStore, combineReducers } from '../src/index'
import { addTodo, dispatchInMiddle, throwError, unknownAction } from './helpers/actionCreators'
import * as reducers from './helpers/reducers'

const falsyValues = [ '', 0, -0, NaN, null ]
const nonFunctions = [ null, undefined, false, true, 42, 'test', {}, [] ]
const nonPlainObjects = [ null, undefined, false, true, 42, 'test', [], new (function AwesomeMap() {})() ]


describe('createStore', () => {
  it('exposes the public API', () => {
    const store = createStore(() => {})
    const methods = Object.keys(store)

    expect(methods.length).toBe(4)
    expect(methods).toContain('subscribe')
    expect(methods).toContain('dispatch')
    expect(methods).toContain('getState')
    expect(methods).toContain('replaceReducer')
  })

  it('throws if reducer is not a function', () => {
    for (let nonFunction of nonFunctions) {
      expect(() => {
        createStore(nonFunction)
      }).toThrow()
    }
  })

  it('accepts a function as reducer', () => {
    expect(() =>
      createStore(() => {})
    ).toNotThrow()
  })

  it('accepts an initial state', () => {
    const initialState = [
      {
        id: 1,
        text: 'Hello'
      }
    ]
    const store = createStore(reducers.todos, initialState)
    expect(store.getState()).toEqual(initialState)
  })

  it('applies the reducer to the initial state', () => {
    const initialState = [
      {
        id: 1,
        text: 'Hello'
      }
    ]
    const store = createStore(reducers.todos, initialState)
    expect(store.getState()).toEqual(initialState)

    store.dispatch(unknownAction())
    expect(store.getState()).toEqual(initialState)

    store.dispatch(addTodo('World'))
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }, {
        id: 2,
        text: 'World'
      }
    ])
  })

  it('throws if enhancer is neither undefined nor a function', () => {
    for (let badValue of without(nonFunctions, undefined)) {
      expect(() =>
        createStore(reducers.todos, undefined, badValue)
      ).toThrow()
    }
  })

  it('accepts either undefined or a function as enhancer', () => {
    expect(() =>
      createStore(reducers.todos, undefined, undefined)
    ).toNotThrow()

    expect(() =>
      createStore(reducers.todos, undefined, x => x)
    ).toNotThrow()

    expect(() =>
      createStore(reducers.todos, x => x)
    ).toNotThrow()

    expect(() =>
      createStore(reducers.todos, [])
    ).toNotThrow()

    expect(() =>
      createStore(reducers.todos, {})
    ).toNotThrow()
  })

  it('accepts enhancer as the third argument', () => {
    const emptyArray = []
    const spyEnhancer = vanillaCreateStore => (...args) => {
      expect(args[0]).toBe(reducers.todos)
      expect(args[1]).toBe(emptyArray)
      expect(args.length).toBe(2)
      const vanillaStore = vanillaCreateStore(...args)
      return {
        ...vanillaStore,
        dispatch: expect.createSpy(vanillaStore.dispatch).andCallThrough()
      }
    }

    const store = createStore(reducers.todos, emptyArray, spyEnhancer)
    const action = addTodo('Hello')
    store.dispatch(action)
    expect(store.dispatch).toHaveBeenCalledWith(action)
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])
  })

  it('accepts enhancer as the second argument if initial state is missing', () => {
    const spyEnhancer = vanillaCreateStore => (...args) => {
      expect(args[0]).toBe(reducers.todos)
      expect(args[1]).toBe(undefined)
      expect(args.length).toBe(2)
      const vanillaStore = vanillaCreateStore(...args)
      return {
        ...vanillaStore,
        dispatch: expect.createSpy(vanillaStore.dispatch).andCallThrough()
      }
    }

    const store = createStore(reducers.todos, spyEnhancer)
    const action = addTodo('Hello')
    store.dispatch(action)
    expect(store.dispatch).toHaveBeenCalledWith(action)
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])
  })

  describe('replaceReducer', () => {
    it('throws if nextReducer is not a function', () => {
      const store = createStore(reducers.todos)

      for (let nonFunction of nonFunctions) {
        expect(() =>
          store.replaceReducer(nonFunction)
        ).toThrow('Expected the nextReducer to be a function.')
      }
    })

    it('accepts a function as nextReducer', () => {
      const store = createStore(reducers.todos)

      expect(() =>
        store.replaceReducer(() => {})
      ).toNotThrow()
    })

    it('preserves the state when replacing a reducer', () => {
      const initialState = [
        {
          id: 1,
          text: 'Hello'
        },
        {
          id: 2,
          text: 'World'
        }
      ]
      const store = createStore(reducers.todos, initialState)
      expect(store.getState()).toEqual(initialState)

      store.replaceReducer(reducers.todosReverse)
      expect(store.getState()).toEqual(initialState)

      store.dispatch(addTodo('Perhaps'))
      expect(store.getState()).toEqual([
        {
          id: 3,
          text: 'Perhaps'
        },
        {
          id: 1,
          text: 'Hello'
        },
        {
          id: 2,
          text: 'World'
        }
      ])

      store.replaceReducer(reducers.todos)
      expect(store.getState()).toEqual([
        {
          id: 3,
          text: 'Perhaps'
        },
        {
          id: 1,
          text: 'Hello'
        },
        {
          id: 2,
          text: 'World'
        }
      ])

      store.dispatch(addTodo('Surely'))
      expect(store.getState()).toEqual([
        {
          id: 3,
          text: 'Perhaps'
        },
        {
          id: 1,
          text: 'Hello'
        },
        {
          id: 2,
          text: 'World'
        },
        {
          id: 4,
          text: 'Surely'
        }
      ])
    })
  })

  describe('subscribe/unsubscribe', () => {
    it('throws if listener is not a function', () => {
      const store = createStore(reducers.todos)

      for (let nonFunction of nonFunctions) {
        expect(() => {
          store.subscribe(nonFunction)
        }).toThrow()
      }
    })

    it('accepts a function as a listener', () => {
      const store = createStore(reducers.todos)

      expect(() => {
        store.subscribe(() => {})
      }).toNotThrow()
    })

    it('supports multiple subscriptions', () => {
      const store = createStore(reducers.todos)
      const listenerA = createSpy()
      const listenerB = createSpy()

      let unsubscribeA = store.subscribe(listenerA)
      store.dispatch(unknownAction())
      expect(listenerA.calls.length).toBe(1)
      expect(listenerB.calls.length).toBe(0)

      store.dispatch(unknownAction())
      expect(listenerA.calls.length).toBe(2)
      expect(listenerB.calls.length).toBe(0)

      const unsubscribeB = store.subscribe(listenerB)
      expect(listenerA.calls.length).toBe(2)
      expect(listenerB.calls.length).toBe(0)

      store.dispatch(unknownAction())
      expect(listenerA.calls.length).toBe(3)
      expect(listenerB.calls.length).toBe(1)

      unsubscribeA()
      expect(listenerA.calls.length).toBe(3)
      expect(listenerB.calls.length).toBe(1)

      store.dispatch(unknownAction())
      expect(listenerA.calls.length).toBe(3)
      expect(listenerB.calls.length).toBe(2)

      unsubscribeB()
      expect(listenerA.calls.length).toBe(3)
      expect(listenerB.calls.length).toBe(2)

      store.dispatch(unknownAction())
      expect(listenerA.calls.length).toBe(3)
      expect(listenerB.calls.length).toBe(2)

      unsubscribeA = store.subscribe(listenerA)
      expect(listenerA.calls.length).toBe(3)
      expect(listenerB.calls.length).toBe(2)

      store.dispatch(unknownAction())
      expect(listenerA.calls.length).toBe(4)
      expect(listenerB.calls.length).toBe(2)
    })

    it('only removes listener once when unsubscribe is called', () => {
      const store = createStore(reducers.todos)
      const listenerA = createSpy()
      const listenerB = createSpy()

      const unsubscribeA = store.subscribe(listenerA)
      store.subscribe(listenerB)

      unsubscribeA()
      unsubscribeA()

      store.dispatch(unknownAction())
      expect(listenerA.calls.length).toBe(0)
      expect(listenerB.calls.length).toBe(1)
    })

    it('only removes relevant listener when unsubscribe is called', () => {
      const store = createStore(reducers.todos)
      const listener = createSpy()

      store.subscribe(listener)
      const unsubscribeSecond = store.subscribe(listener)

      unsubscribeSecond()
      unsubscribeSecond()

      store.dispatch(unknownAction())
      expect(listener.calls.length).toBe(1)
    })

    it('supports removing a subscription within a subscription', () => {
      const store = createStore(reducers.todos)
      const listenerA = createSpy()
      const listenerB = createSpy().andCall(() => unSubB())
      const listenerC = createSpy()

      store.subscribe(listenerA)
      const unSubB = store.subscribe(listenerB)
      store.subscribe(listenerC)

      store.dispatch(unknownAction())
      store.dispatch(unknownAction())

      expect(listenerA.calls.length).toBe(2)
      expect(listenerB.calls.length).toBe(1)
      expect(listenerC.calls.length).toBe(2)
    })
  })

  describe('dispatch', () => {
    it('only accepts plain object actions', () => {
      const store = createStore(reducers.todos)
      expect(() =>
        store.dispatch(unknownAction())
      ).toNotThrow()

      for (let nonPlainObject of nonPlainObjects) {
        expect(() => {
          store.dispatch(nonPlainObject)
        }).toThrow(/plain/)
      }
    })

    it('throws if action type is missing', () => {
      const store = createStore(reducers.todos)
      expect(() =>
        store.dispatch({})
      ).toThrow(/Actions may not have an undefined "type" property/)
    })

    it('throws if action type is undefined', () => {
      const store = createStore(reducers.todos)
      expect(() =>
        store.dispatch({ type: undefined })
      ).toThrow(/Actions may not have an undefined "type" property/)
    })

    it('does not throw if action type is falsy', () => {
      const store = createStore(reducers.todos)

      for (let falsyValue of falsyValues) {
        expect(() =>
          store.dispatch({ type: falsyValue })
        ).toNotThrow()
      }
    })

    it('does not allow dispatch() from within a reducer', () => {
      const store = createStore(reducers.dispatchInTheMiddleOfReducer)

      expect(() =>
        store.dispatch(dispatchInMiddle(store.dispatch.bind(store, unknownAction())))
      ).toThrow(/may not dispatch/)
    })

    it('recovers from an error within a reducer', () => {
      const store = createStore(reducers.errorThrowingReducer)
      expect(() =>
        store.dispatch(throwError())
      ).toThrow()

      expect(() =>
        store.dispatch(unknownAction())
      ).toNotThrow()
    })

    it('applies the reducer to the previous state', () => {
      const store = createStore(reducers.todos)
      expect(store.getState()).toEqual([])

      store.dispatch(unknownAction())
      expect(store.getState()).toEqual([])

      store.dispatch(addTodo('Hello'))
      expect(store.getState()).toEqual([
        {
          id: 1,
          text: 'Hello'
        }
      ])

      store.dispatch(addTodo('World'))
      expect(store.getState()).toEqual([
        {
          id: 1,
          text: 'Hello'
        }, {
          id: 2,
          text: 'World'
        }
      ])
    })

    it('provides an up-to-date state when a subscriber is notified', done => {
      const store = createStore(reducers.todos)
      store.subscribe(() => {
        expect(store.getState()).toEqual([
          {
            id: 1,
            text: 'Hello'
          }
        ])
        done()
      })
      store.dispatch(addTodo('Hello'))
    })

    it('delays subscribe until the end of current dispatch', () => {
      const store = createStore(reducers.todos)

      const listener1 = createSpy()
      const listener2 = createSpy().andCall(() => maybeAddThirdListener())
      const listener3 = createSpy()

      let listener3Added = false
      const maybeAddThirdListener = () => {
        if (!listener3Added) {
          listener3Added = true
          store.subscribe(listener3)
        }
      }

      store.subscribe(listener1)
      store.subscribe(listener2)

      store.dispatch(unknownAction())
      expect(listener1.calls.length).toBe(1)
      expect(listener2.calls.length).toBe(1)
      expect(listener3.calls.length).toBe(0)

      store.dispatch(unknownAction())
      expect(listener1.calls.length).toBe(2)
      expect(listener2.calls.length).toBe(2)
      expect(listener3.calls.length).toBe(1)
    })

    it('delays unsubscribe until the end of current dispatch', () => {
      const store = createStore(reducers.todos)

      const doUnsubscribeAll = () => unsubscribeHandles.forEach(
        unsubscribe => unsubscribe()
      )

      const listener1 = createSpy()
      const listener2 = createSpy().andCall(() => doUnsubscribeAll())
      const listener3 = createSpy()

      const unsubscribeHandles = [ listener1, listener2 , listener3 ].map(listener => {
        return store.subscribe(listener)
      })

      store.dispatch(unknownAction())
      expect(listener1.calls.length).toBe(1)
      expect(listener2.calls.length).toBe(1)
      expect(listener3.calls.length).toBe(1)

      store.dispatch(unknownAction())
      expect(listener1.calls.length).toBe(1)
      expect(listener2.calls.length).toBe(1)
      expect(listener3.calls.length).toBe(1)
    })
    
    it('handles nested dispatches gracefully', () => {
      function foo(state = 0, action) {
        return action.type === 'foo' ? 1 : state
      }

      function bar(state = 0, action) {
        return action.type === 'bar' ? 2 : state
      }

      const store = createStore(combineReducers({ foo, bar }))

      store.subscribe(function kindaComponentDidUpdate() {
        const state = store.getState()
        if (state.bar === 0) {
          store.dispatch({ type: 'bar' })
        }
      })

      store.dispatch({ type: 'foo' })
      expect(store.getState()).toEqual({
        foo: 1,
        bar: 2
      })
    })

    it('uses the last snapshot of subscribers during nested dispatch', () => {
      const store = createStore(reducers.todos)

      const listener1 = createSpy().andCall(() => {
        expect(listener1.calls.length).toBe(1)
        expect(listener2.calls.length).toBe(0)
        expect(listener3.calls.length).toBe(0)
        expect(listener4.calls.length).toBe(0)

        unsubscribe1()
        unsubscribe4 = store.subscribe(listener4)
        store.dispatch(unknownAction())

        expect(listener1.calls.length).toBe(1)
        expect(listener2.calls.length).toBe(1)
        expect(listener3.calls.length).toBe(1)
        expect(listener4.calls.length).toBe(1)
      })
      const listener2 = createSpy()
      const listener3 = createSpy()
      const listener4 = createSpy()

      let unsubscribe4
      const unsubscribe1 = store.subscribe(listener1)
      store.subscribe(listener2)
      store.subscribe(listener3)

      store.dispatch(unknownAction())
      expect(listener1.calls.length).toBe(1)
      expect(listener2.calls.length).toBe(2)
      expect(listener3.calls.length).toBe(2)
      expect(listener4.calls.length).toBe(1)

      unsubscribe4()
      store.dispatch(unknownAction())
      expect(listener1.calls.length).toBe(1)
      expect(listener2.calls.length).toBe(3)
      expect(listener3.calls.length).toBe(3)
      expect(listener4.calls.length).toBe(1)
    })
  })
})
