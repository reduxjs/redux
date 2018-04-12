// @flow

import { visibleTodosSelector } from './index';

describe('visibleTodosSelector', () => {
  let state;
  beforeEach(() => {
    state = {
      todos: [
        { id: 0, text: 'Test Todo 1', completed: false },
        { id: 1, text: 'Test Todo 2', completed: true }
      ],
      visibilityFilter: 'SHOW_ALL'
    };
  });

  test('should handle SHOW_ALL', () => {
    expect(visibleTodosSelector(state)).toEqual([
      { id: 0, text: 'Test Todo 1', completed: false },
      { id: 1, text: 'Test Todo 2', completed: true }
    ]);
  });

  test('should handle SHOW_ACTIVE', () => {
    state.visibilityFilter = 'SHOW_ACTIVE';
    expect(visibleTodosSelector(state)).toEqual([
      { id: 0, text: 'Test Todo 1', completed: false }
    ]);
  });

  test('should handle SHOW_COMPLETED', () => {
    state.visibilityFilter = 'SHOW_COMPLETED';
    expect(visibleTodosSelector(state)).toEqual([
      { id: 1, text: 'Test Todo 2', completed: true }
    ]);
  });
});
