import * as types from './types'
import api from '../../api/index'

export const fetchTodos = () => dispatch =>
  api
    .get('/todos')
    .then(({data: todos}) => dispatch({type: types.FETCH_TODOS.SUCCESS, todos}))

export const addTodo = todo => dispatch =>
  api
    .post('/todos', todo)
    .then(({data: todo}) => dispatch({type: types.ADD_TODO.SUCCESS, todo}))

export const deleteTodo = id => dispatch =>
  api
    .delete(`/todos/${id}`)
    .then(() => dispatch({type: types.DELETE_TODO.SUCCESS, id}))

export const editTodo = todo => dispatch =>
  api
    .put(`/todos/${todo.id}`, todo)
    .then(({data: todo}) => dispatch({type: types.EDIT_TODO.SUCCESS, todo}))

export const completeTodo = todo =>
  editTodo({...todo, completed: !todo.completed})

export const completeAll = () => (dispatch, getState) =>
  getState()
    .todos.filter(todo => !todo.completed)
    .map(todo => editTodo({...todo, completed: true})(dispatch))

export const clearCompleted = () => (dispatch, getState) =>
  getState()
    .todos.filter(todo => todo.completed)
    .map(todo => deleteTodo(todo.id)(dispatch))
