import expect from 'expect'
import { bindActionCreators, createStore } from '../src'
import { todos } from './helpers/reducers'
import * as actionCreators from './helpers/actionCreators'

describe('bindActionCreators', () => {
  let store

  beforeEach(() => {
    store = createStore(todos)
  })

  it('wraps the action creators with the dispatch function', () => {
    const notNestedActionCreators = { ...actionCreators }
    delete notNestedActionCreators.nestedActions
    const boundActionCreators = bindActionCreators(notNestedActionCreators, store.dispatch)
    expect(
      Object.keys(boundActionCreators)
    ).toEqual(
      Object.keys(notNestedActionCreators)
    )

    const action = boundActionCreators.addTodo('Hello')
    expect(action).toEqual(
      actionCreators.addTodo('Hello')
    )
    expect(store.getState()).toEqual([
      { id: 1, text: 'Hello' }
    ])
  })

  it('supports wrapping a single function only', () => {
    const actionCreator = actionCreators.addTodo
    const boundActionCreator = bindActionCreators(actionCreator, store.dispatch)

    const action = boundActionCreator('Hello')
    expect(action).toEqual(actionCreator('Hello'))
    expect(store.getState()).toEqual([
      { id: 1, text: 'Hello' }
    ])
  })

  it('supports a nested object of action creators', () => {
    const boundActionCreators = bindActionCreators(actionCreators, store.dispatch)
    const { nestedActions } = boundActionCreators

    expect(nestedActions).toBeA('object')
    expect(nestedActions.addTodo).toBeA('function')

    const action = nestedActions.addTodo('Hello')
    expect(action).toEqual(
      actionCreators.nestedActions.addTodo('Hello')
    )
    expect(store.getState()).toEqual([
      { id: 1, text: 'Hello' }
    ])
  })

  it('throws for an undefined actionCreator', () => {
    expect(() => {
      bindActionCreators(undefined, store.dispatch)
    }).toThrow(
      'bindActionCreators expected an object or a function, instead received undefined. ' +
      'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?'
    )
  })

  it('throws for a null actionCreator', () => {
    expect(() => {
      bindActionCreators(null, store.dispatch)
    }).toThrow(
      'bindActionCreators expected an object or a function, instead received null. ' +
      'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?'
    )
  })

  it('throws for a primitive actionCreator', () => {
    expect(() => {
      bindActionCreators('string', store.dispatch)
    }).toThrow(
      'bindActionCreators expected an object or a function, instead received string. ' +
      'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?'
    )
  })
})
