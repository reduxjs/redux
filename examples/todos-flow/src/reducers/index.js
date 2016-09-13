// @flow
import todos from './todos'
import visibilityFilter from './visibilityFilter'
import type { State, Action } from '../types'

export default function todoApp(state: ?State, action: Action): State {
  const s = state || {}
  return {
    todos: todos(s.todos, action),
    visibilityFilter: visibilityFilter(s.visibilityFilter, action)
  }
}
