import expect from 'expect';
import reducer from '../../reducers/todos';
import * as types from '../../constants/ActionTypes';

describe('todos reducer', () => {

  it('should handle initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual([{
      text: 'Use Redux',
      marked: false,
      id: 0
    }]);
  });

  it('should handle ADD_TODO', () => {
    expect(
      reducer([], {
        type: types.ADD_TODO,
        text: 'Run the tests'
      })
    ).toEqual([
      {
      text: 'Run the tests',
      marked: false,
      id: 0
    }]);

    expect(
      reducer([{
        text: 'Use Redux',
        marked: false,
        id: 0
      }], {
        type: types.ADD_TODO,
        text: 'Run the tests'
      })
    ).toEqual([{
      text: 'Run the tests',
      marked: false,
      id: 1
    }, {
      text: 'Use Redux',
      marked: false,
      id: 0
    }]);
  });

  it('should handle DELETE_TODO', () => {
    expect(
      reducer([{
        text: 'Run the tests',
        marked: false,
        id: 1
      }, {
        text: 'Use Redux',
        marked: false,
        id: 0
      }], {
        type: types.DELETE_TODO,
        id: 1
      })
    ).toEqual([{
      text: 'Use Redux',
      marked: false,
      id: 0
    }]);
  });

  it('should handle EDIT_TODO', () => {
    expect(
      reducer([{
        text: 'Run the tests',
        marked: false,
        id: 1
      }, {
        text: 'Use Redux',
        marked: false,
        id: 0
      }], {
        type: types.EDIT_TODO,
        text: 'Fix the tests',
        id: 1
      })
    ).toEqual([{
      text: 'Fix the tests',
      marked: false,
      id: 1
    }, {
      text: 'Use Redux',
      marked: false,
      id: 0
    }]);
  });

  it('should handle MARK_TODO', () => {
    expect(
      reducer([{
        text: 'Run the tests',
        marked: false,
        id: 1
      }, {
        text: 'Use Redux',
        marked: false,
        id: 0
      }], {
        type: types.MARK_TODO,
        id: 1
      })
    ).toEqual([{
      text: 'Run the tests',
      marked: true,
      id: 1
    }, {
      text: 'Use Redux',
      marked: false,
      id: 0
    }]);
  });

  it('should handle MARK_ALL', () => {
    expect(
      reducer([{
        text: 'Run the tests',
        marked: true,
        id: 1
      }, {
        text: 'Use Redux',
        marked: false,
        id: 0
      }], {
        type: types.MARK_ALL
      })
    ).toEqual([{
      text: 'Run the tests',
      marked: true,
      id: 1
    }, {
      text: 'Use Redux',
      marked: true,
      id: 0
    }]);

    // Unmark if all todos are currently marked
    expect(
      reducer([{
        text: 'Run the tests',
        marked: true,
        id: 1
      }, {
        text: 'Use Redux',
        marked: true,
        id: 0
      }], {
        type: types.MARK_ALL
      })
    ).toEqual([{
      text: 'Run the tests',
      marked: false,
      id: 1
    }, {
      text: 'Use Redux',
      marked: false,
      id: 0
    }]);
  });

  it('should handle CLEAR_MARKED', () => {
    expect(
      reducer([{
        text: 'Run the tests',
        marked: true,
        id: 1
      }, {
        text: 'Use Redux',
        marked: false,
        id: 0
      }], {
        type: types.CLEAR_MARKED
      })
    ).toEqual([{
      text: 'Use Redux',
      marked: false,
      id: 0
    }]);
  });
});
