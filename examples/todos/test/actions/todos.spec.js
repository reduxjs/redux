import Actions from '../../src/actions'
// sinon from 'sinon'
import { expect } from 'chai'

describe('todo actions', () => {
  let store
  let actions

  beforeEach(() => {
    store = new MockStore()
    actions = new Actions(store)
  })

  it('addTodo should create ADD_TODO action', () => {
    actions.addTodo('Use Redux')

    expect(store.dispatchTimes).to.equal(1)
    expect(store.lastDispatched).to.deep.equal({
      type: 'ADD_TODO',
      id: 0,
      text: 'Use Redux'
    })
  })

  it('setVisibilityFilter should create SET_VISIBILITY_FILTER action', () => {
    actions.setVisibilityFilter('active')

    expect(store.dispatchTimes).to.equal(1)
    expect(store.lastDispatched).to.deep.equal({
      type: 'SET_VISIBILITY_FILTER',
      filter: 'active'
    })
  })

  it('toogleTodo should create TOGGLE_TODO action', () => {
    actions.toggleTodo(1)

    expect(store.dispatchTimes).to.equal(1)
    expect(store.lastDispatched).to.deep.equal({
      type: 'TOGGLE_TODO',
      id: 1
    })
  })

  class MockStore {
    constructor() {
      this.dispatchTimes = 0
    }
    dispatch(obj) {
      this.lastDispatched = obj
      this.dispatchTimes++
    }
  }
})
