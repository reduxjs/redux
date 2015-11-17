import expect from 'expect'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import * as actions from '../../actions/counter'

const middlewares = [ thunk ]

/*
 * Creates a mock of Redux store with middleware.
 */
function mockStore(getState, expectedActions, onLastAction) {
  if (!Array.isArray(expectedActions)) {
    throw new Error('expectedActions should be an array of expected actions.')
  }
  if (typeof onLastAction !== 'undefined' && typeof onLastAction !== 'function') {
    throw new Error('onLastAction should either be undefined or function.')
  }

  function mockStoreWithoutMiddleware() {
    return {
      getState() {
        return typeof getState === 'function' ?
          getState() :
          getState
      },

      dispatch(action) {
        const expectedAction = expectedActions.shift()
        expect(action).toEqual(expectedAction)
        if (onLastAction && !expectedActions.length) {
          onLastAction()
        }
        return action
      }
    }
  }

  const mockStoreWithMiddleware = applyMiddleware(
    ...middlewares
  )(mockStoreWithoutMiddleware)

  return mockStoreWithMiddleware()
}

describe('actions', () => {
  it('increment should create increment action', () => {
    expect(actions.increment()).toEqual({ type: actions.INCREMENT_COUNTER })
  })

  it('decrement should create decrement action', () => {
    expect(actions.decrement()).toEqual({ type: actions.DECREMENT_COUNTER })
  })

  it('incrementIfOdd should create increment action', (done) => {
    const expectedActions = [
      { type: actions.INCREMENT_COUNTER }
    ]
    const store = mockStore({ counter: 1 }, expectedActions, done)
    store.dispatch(actions.incrementIfOdd())
  })

  it('incrementIfOdd shouldnt create increment action if counter is even', (done) => {
    const expectedActions = []
    const store = mockStore({ counter: 2 }, expectedActions)
    store.dispatch(actions.incrementIfOdd())
    done()
  })

  it('incrementAsync should create increment action', (done) => {
    const expectedActions = [
      { type: actions.INCREMENT_COUNTER }
    ]
    const store = mockStore({ counter: 0 }, expectedActions, done)
    store.dispatch(actions.incrementAsync(100))
  })
})
