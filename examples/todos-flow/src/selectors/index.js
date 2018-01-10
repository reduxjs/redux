// @flow

import { createSelector } from 'reselect';

import type { State } from '../types';

const todosSelector = (state: State) => state.todos;
const visibilityFilterSelector = (state: State) => state.visibilityFilter;

export const visibleTodosSelector = createSelector(
  todosSelector,
  visibilityFilterSelector,
  (todos, visibilityFilter) => {
    switch (visibilityFilter) {
      case 'SHOW_COMPLETED':
        return todos.filter(t => t.completed);
      case 'SHOW_ACTIVE':
        return todos.filter(t => !t.completed);
      case 'SHOW_ALL':
      default:
        return todos;
    }
  }
);
