let nextTodoId = 0

type AddTodoType = {
  type: 'ADD_TODO',
  id: number,
  text: string
}

type SetVisibilityFilterType = {
  type: 'SET_VISIBILITY_FILTER',
  filter: string
}

type ToggleTodoType = {
  type: 'TOGGLE_TODO',
  id: number
}

export const addTodo = (text: string): AddTodoType => ({
  type: 'ADD_TODO',
  id: nextTodoId++,
  text
})

export const setVisibilityFilter = (filter: string): SetVisibilityFilterType => ({
  type: 'SET_VISIBILITY_FILTER',
  filter
})

export const toggleTodo = (id: number): ToggleTodoType => ({
  type: 'TOGGLE_TODO',
  id
})

export const VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
}
