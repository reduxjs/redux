import Immutable from 'immutable'
import {
  ADD_TODO,
  DELETE_TODO,
  EDIT_TODO,
  COMPLETE_TODO,
  COMPLETE_ALL,
  CLEAR_COMPLETED
} from '../constants/ActionTypes'

const makeId = state =>
  state.reduce((maxId, todo) => Math.max(todo.get('id'), maxId), -1) + 1

const initialState = Immutable.fromJS([
  {
    text: 'Use Redux',
    completed: false,
    id: 0
  },
  {
    text: 'Use Immutable',
    completed: false,
    id: 1
  }
])

export default function todos(state = initialState, action) {
  const index = state.findIndex(item => {
    return item.get('id') === action.id
  })

  switch (action.type) {
    case ADD_TODO:
      return state.push(
        Immutable.Map({
          id: makeId(state),
          completed: false,
          text: action.text
        })
      )

    case DELETE_TODO:
      return state.filter(todo => todo.get('id') !== action.id)

    case EDIT_TODO:
      return state.update(index, todo => {
        return todo.set('text', action.text)
      })

    case COMPLETE_TODO:
      return state.update(index, todo => {
        return todo.set('completed', !todo.get('completed'))
      })

    case COMPLETE_ALL:
      const areAllMarked = state.every(todo => todo.get('completed'))
      return state.map(todo => ({
        ...todo,
        completed: !areAllMarked
      }))

    case CLEAR_COMPLETED:
      return state.filter(todo => todo.get('completed') === false)

    default:
      return state
  }
}
