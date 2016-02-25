import Actions from '../../src//actions'
import sinon from 'sinon'
import { should } from 'chai'

describe('todo actions', () => {
  let dispatch
  let actions

  beforeEach(() => {
    dispatch = sinon.spy()
    actions = new Actions({dispatch})
  })

  it.only('addTodo should create ADD_TODO action', () => {
    actions.addTodo('Use Redux')

    should(dispatch.calledOnce).be.true
    should(dispatch.calledWith({
      type: 'ADD_TODO',
      id: 0,
      text: 'Use Redux'
    })).be.true
  })

  it('setVisibilityFilter should create SET_VISIBILITY_FILTER action', () => {
    actions.setVisibilityFilter('active')

    should(dispatch.calledOnce).be.true
    should(dispatch.calledWith({
      type: 'SET_VISIBILITY_FILTER',
      filter: 'active'
    })).be.true
  })

  it('toogleTodo should create TOGGLE_TODO action', () => {
    actions.toggleTodo(1)

    should(dispatch.calledOnce).be.true
    should(dispatch.calledWith({
      type: 'TOGGLE_TODO',
      id: 1
    })).be.true
  })
})
