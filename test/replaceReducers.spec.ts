import { createStore, combineReducers } from '..'

describe('replaceReducers test', () => {
  it('returns the original store', () => {
    const nextReducer = combineReducers({
      foo: (state = 1, _action) => state,
      bar: (state = 2, _action) => state
    })
    const store = createStore((state, action) => {
      if (state === undefined) return { type: 5 }
      return action
    })

    const nextStore = store.replaceReducer(nextReducer)

    expect(nextStore).toBe(store)
  })
})
