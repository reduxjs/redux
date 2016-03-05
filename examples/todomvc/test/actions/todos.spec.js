import expect from 'expect'
import * as actions from '../../actions'
import * as ActionTypes from '../../constants/ActionTypes'

describe('todo actions', () => {
  it('addTodo should create ADD_TODO action', () => {
    expect(actions.addTodo('Use Redux')).toEqual({
      type: ActionTypes.ADD_TODO,
      text: 'Use Redux'
    })
  })

  it('setVisibilityFilter should create SET_VISIBILITY_FILTER action', () => {
    expect(actions.setVisibilityFilter('active')).toEqual({
      type: ActionTypes.SET_VISIBILITY_FILTER,
      filter: 'active'
    })
  })

  it('deleteTodo should create DELETE_TODO action', () => {
    expect(actions.deleteTodo(1)).toEqual({
      type: ActionTypes.DELETE_TODO,
      id: 1
    })
  })

  it('editTodo should create EDIT_TODO action', () => {
    expect(actions.editTodo(1, 'Use Redux')).toEqual({
      type: ActionTypes.EDIT_TODO,
      id: 1,
      text: 'Use Redux'
    })
  })

  it('completeTodo should create COMPLETE_TODO action', () => {
    expect(actions.completeTodo(1)).toEqual({
      type: ActionTypes.COMPLETE_TODO,
      id: 1
    })
  })

  it('clearCompleted should create CLEAR_COMPLETED action', () => {
    expect(actions.clearCompleted()).toEqual({
      type: ActionTypes.CLEAR_COMPLETED
    })
  })

  it('completeAll should create COMPLETE_ALL action', () => {
    expect(actions.completeAll()).toEqual({
      type: ActionTypes.COMPLETE_ALL
    })
  })
})
