import expect from 'expect'
import { createStore, combineReducers } from '../src/index'
import { addTodo, dispatchInMiddle, throwError, unknownAction } from './helpers/actionCreators'
import * as reducers from './helpers/reducers'
import * as Rx from 'rxjs'
import $$observable from 'symbol-observable'

describe('createStore', () => {
  it('exposes the public API', () => {
    const store = createStore(combineReducers(reducers))
    const methods = Object.keys(store)

    expect(methods.length).toBe(4)
    expect(methods).toContain('subscribe')
    expect(methods).toContain('dispatch')
    expect(methods).toContain('getState')
    expect(methods).toContain('replaceReducer')
  })

  it('throws if reducer is not a function', () => {
    expect(() =>
      createStore()
    ).toThrow()

    expect(() =>
      createStore('test')
    ).toThrow()

    expect(() =>
      createStore({})
    ).toThrow()

    expect(() =>
      createStore(() => {})
    ).toNotThrow()
  })

  it('passes the initial action and the initial state', () => {
    const store = createStore(reducers.todos, [
      {
        id: 1,
        text: 'Hello'
      }
    ])
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])
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

  it('applies the reducer to the initial state', () => {
    const store = createStore(reducers.todos, [
      {
        id: 1,
        text: 'Hello'
      }
    ])
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])

    store.dispatch(unknownAction())
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

  it('preserves the state when replacing a reducer', () => {
    const store = createStore(reducers.todos)
    store.dispatch(addTodo('Hello'))
    store.dispatch(addTodo('World'))
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      },
      {
        id: 2,
        text: 'World'
      }
    ])

    store.replaceReducer(reducers.todosReverse)
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }, {
        id: 2,
        text: 'World'
      }
    ])

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

  it('supports multiple subscriptions', () => {
    const store = createStore(reducers.todos)
    const listenerA = expect.createSpy(() => {})
    const listenerB = expect.createSpy(() => {})

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
    const listenerA = expect.createSpy(() => {})
    const listenerB = expect.createSpy(() => {})

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
    const listener = expect.createSpy(() => {})

    store.subscribe(listener)
    const unsubscribeSecond = store.subscribe(listener)

    unsubscribeSecond()
    unsubscribeSecond()

    store.dispatch(unknownAction())
    expect(listener.calls.length).toBe(1)
  })

  it('supports removing a subscription within a subscription', () => {
    const store = createStore(reducers.todos)
    const listenerA = expect.createSpy(() => {})
    const listenerB = expect.createSpy(() => {})
    const listenerC = expect.createSpy(() => {})

    store.subscribe(listenerA)
    const unSubB = store.subscribe(() => {
      listenerB()
      unSubB()
    })
    store.subscribe(listenerC)

    store.dispatch(unknownAction())
    store.dispatch(unknownAction())

    expect(listenerA.calls.length).toBe(2)
    expect(listenerB.calls.length).toBe(1)
    expect(listenerC.calls.length).toBe(2)
  })

  it('delays unsubscribe until the end of current dispatch', () => {
    const store = createStore(reducers.todos)

    const unsubscribeHandles = []
    const doUnsubscribeAll = () => unsubscribeHandles.forEach(
      unsubscribe => unsubscribe()
    )

    const listener1 = expect.createSpy(() => {})
    const listener2 = expect.createSpy(() => {})
    const listener3 = expect.createSpy(() => {})

    unsubscribeHandles.push(store.subscribe(() => listener1()))
    unsubscribeHandles.push(store.subscribe(() => {
      listener2()
      doUnsubscribeAll()
    }))
    unsubscribeHandles.push(store.subscribe(() => listener3()))

    store.dispatch(unknownAction())
    expect(listener1.calls.length).toBe(1)
    expect(listener2.calls.length).toBe(1)
    expect(listener3.calls.length).toBe(1)

    store.dispatch(unknownAction())
    expect(listener1.calls.length).toBe(1)
    expect(listener2.calls.length).toBe(1)
    expect(listener3.calls.length).toBe(1)
  })

  it('delays subscribe until the end of current dispatch', () => {
    const store = createStore(reducers.todos)

    const listener1 = expect.createSpy(() => {})
    const listener2 = expect.createSpy(() => {})
    const listener3 = expect.createSpy(() => {})

    let listener3Added = false
    const maybeAddThirdListener = () => {
      if (!listener3Added) {
        listener3Added = true
        store.subscribe(() => listener3())
      }
    }

    store.subscribe(() => listener1())
    store.subscribe(() => {
      listener2()
      maybeAddThirdListener()
    })

    store.dispatch(unknownAction())
    expect(listener1.calls.length).toBe(1)
    expect(listener2.calls.length).toBe(1)
    expect(listener3.calls.length).toBe(0)

    store.dispatch(unknownAction())
    expect(listener1.calls.length).toBe(2)
    expect(listener2.calls.length).toBe(2)
    expect(listener3.calls.length).toBe(1)
  })

  it('uses the last snapshot of subscribers during nested dispatch', () => {
    const store = createStore(reducers.todos)

    const listener1 = expect.createSpy(() => {})
    const listener2 = expect.createSpy(() => {})
    const listener3 = expect.createSpy(() => {})
    const listener4 = expect.createSpy(() => {})

    let unsubscribe4
    const unsubscribe1 = store.subscribe(() => {
      listener1()
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

  it('only accepts plain object actions', () => {
    const store = createStore(reducers.todos)
    expect(() =>
      store.dispatch(unknownAction())
    ).toNotThrow()

    function AwesomeMap() { }
    [ null, undefined, 42, 'hey', new AwesomeMap() ].forEach(nonObject =>
      expect(() =>
        store.dispatch(nonObject)
      ).toThrow(/plain/)
    )
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
    expect(() =>
      store.dispatch({ type: false })
    ).toNotThrow()
    expect(() =>
      store.dispatch({ type: 0 })
    ).toNotThrow()
    expect(() =>
      store.dispatch({ type: null })
    ).toNotThrow()
    expect(() =>
      store.dispatch({ type: '' })
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

  it('throws if enhancer is neither undefined nor a function', () => {
    expect(() =>
      createStore(reducers.todos, undefined, {})
    ).toThrow()

    expect(() =>
      createStore(reducers.todos, undefined, [])
    ).toThrow()

    expect(() =>
      createStore(reducers.todos, undefined, null)
    ).toThrow()

    expect(() =>
      createStore(reducers.todos, undefined, false)
    ).toThrow()

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

  it('throws if nextReducer is not a function', () => {
    const store = createStore(reducers.todos)

    expect(() =>
      store.replaceReducer()
    ).toThrow('Expected the nextReducer to be a function.')

    expect(() =>
      store.replaceReducer(() => {})
    ).toNotThrow()
  })

  it('throws if listener is not a function', () => {
    const store = createStore(reducers.todos)

    expect(() =>
      store.subscribe()
    ).toThrow()

    expect(() =>
      store.subscribe('')
    ).toThrow()

    expect(() =>
      store.subscribe(null)
    ).toThrow()

    expect(() =>
      store.subscribe(undefined)
    ).toThrow()
  })

  describe('Symbol.observable interop point', () => {
    it('should exist', () => {
      const store = createStore(() => {})
      expect(typeof store[$$observable]).toBe('function')
    })

    describe('returned value', () => {
      it('should be subscribable', () => {
        const store = createStore(() => {})
        const obs = store[$$observable]()
        expect(typeof obs.subscribe).toBe('function')
      })

      it('should throw a TypeError if an observer object is not supplied to subscribe', () => {
        const store = createStore(() => {})
        const obs = store[$$observable]()

        expect(function () {
          obs.subscribe()
        }).toThrow()

        expect(function () {
          obs.subscribe(() => {})
        }).toThrow()

        expect(function () {
          obs.subscribe({})
        }).toNotThrow()
      })

      it('should return a subscription object when subscribed', () => {
        const store = createStore(() => {})
        const obs = store[$$observable]()
        const sub = obs.subscribe({})
        expect(typeof sub.unsubscribe).toBe('function')
      })
    })

    it('should pass an integration test with no unsubscribe', () => {
      function foo(state = 0, action) {
        return action.type === 'foo' ? 1 : state
      }

      function bar(state = 0, action) {
        return action.type === 'bar' ? 2 : state
      }

      const store = createStore(combineReducers({ foo, bar }))
      const observable = store[$$observable]()
      const results = []

      observable.subscribe({
        next(state) {
          results.push(state)
        }
      })

      store.dispatch({ type: 'foo' })
      store.dispatch({ type: 'bar' })

      expect(results).toEqual([ { foo: 0, bar: 0 }, { foo: 1, bar: 0 }, { foo: 1, bar: 2 } ])
    })

    it('should pass an integration test with an unsubscribe', () => {
      function foo(state = 0, action) {
        return action.type === 'foo' ? 1 : state
      }

      function bar(state = 0, action) {
        return action.type === 'bar' ? 2 : state
      }

      const store = createStore(combineReducers({ foo, bar }))
      const observable = store[$$observable]()
      const results = []

      const sub = observable.subscribe({
        next(state) {
          results.push(state)
        }
      })

      store.dispatch({ type: 'foo' })
      sub.unsubscribe()
      store.dispatch({ type: 'bar' })

      expect(results).toEqual([ { foo: 0, bar: 0 }, { foo: 1, bar: 0 } ])
    })

    it('should pass an integration test with a common library (RxJS)', () => {
      function foo(state = 0, action) {
        return action.type === 'foo' ? 1 : state
      }

      function bar(state = 0, action) {
        return action.type === 'bar' ? 2 : state
      }

      const store = createStore(combineReducers({ foo, bar }))
      const observable = Rx.Observable.from(store)
      const results = []

      const sub = observable
        .map(state => ({ fromRx: true, ...state }))
        .subscribe(state => results.push(state))

      store.dispatch({ type: 'foo' })
      sub.unsubscribe()
      store.dispatch({ type: 'bar' })

      expect(results).toEqual([ { foo: 0, bar: 0, fromRx: true }, { foo: 1, bar: 0, fromRx: true } ])
    })
  })
})
