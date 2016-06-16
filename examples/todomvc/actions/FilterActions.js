import * as types from '../constants/TodoFilters'

export function showAll() {
  	return {type:types.SHOW_ALL}
}

export function showActive() {
  return {type:types.SHOW_ACTIVE}
}

export function showCompleted() {
  return {type:types.SHOW_COMPLETED}
}