import reducer from '../../reducers';
import { State } from '../../types';

describe('root reducer', () => {
  it('should combine all reducers', () => {
    expect(reducer({} as State, { type: '@@INIT' })).toEqual({
      todos: [],
      visibilityFilter: 'SHOW_ALL'
    });
  });
});
