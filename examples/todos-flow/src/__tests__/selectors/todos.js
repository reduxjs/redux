// @flow

import { visibleTodosSelector } from '../../selectors';

describe('visibleTodosSelector', () => {
  let state;
  beforeEach(() => {
    state = {
      todos: [
        { id: 0, text: 'Test Todo', completed: false },
        { id: 0, text: 'Test Todo', completed: false }
      ],
      visibilityFilter: 'SHOW_ALL'
    };
  });

  test('should handle SHOW_ALL', () => {
    expect(visibleTodosSelector(state)).toMatchSnapshot();
  });

  test('should handle SHOW_ACTIVE', () => {
    state.visibilityFilter = 'SHOW_ACTIVE';
    expect(visibleTodosSelector(state)).toMatchSnapshot();
  });

  test('should handle SHOW_COMPLETED', () => {
    state.visibilityFilter = 'SHOW_COMPLETED';
    expect(visibleTodosSelector(state)).toMatchSnapshot();
  });
});
