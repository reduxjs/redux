import { createSelector } from 'reselect'
import * as TodoFilters from '../constants/TodoFilters'

const getVisibilityFilter = (state) => state.visibilityFilter
const getTodos = (state) => state.todos

export const getVisibleTodos = createSelector(
  [ getVisibilityFilter, getTodos ],
  (visibilityFilter, todos) => {
    switch (visibilityFilter) {
      case TodoFilters.SHOW_ALL:
        return todos
      case TodoFilters.SHOW_COMPLETED:
        return todos.filter(t => t.completed)
      case TodoFilters.SHOW_ACTIVE:
        return todos.filter(t => !t.completed)
    }
  }
)

export const getActiveCount = createSelector(
  [ getTodos ],
  (todos) => todos.filter(todo => !todo.completed).length
)

export const getCompletedCount = createSelector(
  [ getTodos ],
  (todos) => todos.filter(todo => todo.completed).length
)
