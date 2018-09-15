import Immutable from 'immutable'
import todos from './todos'
import * as types from '../constants/ActionTypes'

describe('todos reducer', () => {
  it('should handle initial state', () => {
    expect(
      todos(undefined, Immutable.Map())
    ).toEqual(Immutable.fromJS([
      {
        text: 'Use Redux',
        completed: false,
        id: 0
      },
      {
        text: 'Use Immutable',
        completed: false,
        id: 1
      }
    ]))
  })

  it('should handle ADD_TODO', () => {
    expect(
      todos(Immutable.fromJS([]), {
        type: types.ADD_TODO,
        text: 'Run the tests'
      })
    ).toEqual(Immutable.fromJS([
      {
        id: 0,
        completed: false,
        text: 'Run the tests',
      }])
    )

    expect(
      todos(Immutable.fromJS([
        {
          text: 'Use Redux',
          completed: false,
          id: 0
        }
      ]), {
        type: types.ADD_TODO,
        text: 'Run the tests'
      })
    ).toEqual(Immutable.fromJS([
      {
        text: 'Use Redux',
        completed: false,
        id: 0
      },
      {
        text: 'Run the tests',
        completed: false,
        id: 1
      }
    ]))

    expect(
      todos(Immutable.fromJS([
        {
          text: 'Use Redux',
          completed: false,
          id: 0
        }, {
          text: 'Run the tests',
          completed: false,
          id: 1
        }
      ]), {
        type: types.ADD_TODO,
        text: 'Fix the tests'
      })
    ).toEqual(Immutable.fromJS([
      {
        text: 'Use Redux',
        completed: false,
        id: 0
      },
      {
        text: 'Run the tests',
        completed: false,
        id: 1
      },
      {
        text: 'Fix the tests',
        completed: false,
        id: 2
      }
    ]))
  })

  it('should handle DELETE_TODO', () => {
    expect(
      todos(Immutable.fromJS([
        {
          text: 'Use Redux',
          completed: false,
          id: 0
        },
        {
          text: 'Run the tests',
          completed: false,
          id: 1
        }
      ]), {
        type: types.DELETE_TODO,
        id: 1
      })
    ).toMatchObject(Immutable.fromJS([
      {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ]))
  })

  it('should handle EDIT_TODO', () => {
    expect(
      todos(Immutable.fromJS([
        {
          text: 'Run the tests',
          completed: false,
          id: 1
        }, {
          text: 'Use Redux',
          completed: false,
          id: 0
        }
      ]), {
        type: types.EDIT_TODO,
        text: 'Fix the tests',
        id: 1
      })
    ).toMatchObject(Immutable.fromJS([
      {
        text: 'Fix the tests',
        completed: false,
        id: 1
      }, {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ]))
  })

  it('should handle COMPLETE_TODO', () => {
    expect(
      todos(Immutable.fromJS([
        {
          text: 'Run the tests',
          completed: false,
          id: 1
        }, {
          text: 'Use Redux',
          completed: false,
          id: 0
        }
      ]), {
        type: types.COMPLETE_TODO,
        id: 1
      })
    ).toMatchObject(Immutable.fromJS([
      {
        text: 'Run the tests',
        completed: true,
        id: 1
      }, {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ]))
  })

  it('should handle COMPLETE_ALL', () => {
    expect(
      todos(Immutable.fromJS([
        {
          text: 'Run the tests',
          completed: true,
          id: 1
        }, {
          text: 'Use Redux',
          completed: false,
          id: 0
        }
      ]), {
        type: types.COMPLETE_ALL
      })
    ).toMatchObject(Immutable.fromJS([
      {
        text: 'Run the tests',
        completed: true,
        id: 1
      }, {
        text: 'Use Redux',
        completed: true,
        id: 0
      }
    ]))

    // Unmark if all todos are currently completed
    expect(
      todos(Immutable.fromJS([
        {
          text: 'Run the tests',
          completed: true,
          id: 1
        }, {
          text: 'Use Redux',
          completed: true,
          id: 0
        }
      ]), {
        type: types.COMPLETE_ALL
      })
    ).toMatchObject(Immutable.fromJS([
      {
        text: 'Run the tests',
        completed: false,
        id: 1
      }, {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ]))
  })

  it('should handle CLEAR_COMPLETED', () => {
    expect(
      todos(Immutable.fromJS([
        {
          text: 'Run the tests',
          completed: true,
          id: 1
        }, {
          text: 'Use Redux',
          completed: false,
          id: 0
        }
      ]), {
        type: types.CLEAR_COMPLETED
      })
    ).toMatchObject(Immutable.fromJS([
      {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ]))
  })

  it('should not generate duplicate ids after CLEAR_COMPLETED', () => {
    expect(
      [
        {
          type: types.COMPLETE_TODO,
          id: 0
        }, {
          type: types.CLEAR_COMPLETED
        }, {
          type: types.ADD_TODO,
          text: 'Write more tests'
        }
      ].reduce(todos, Immutable.fromJS([
        {
          id: 0,
          completed: false,
          text: 'Use Redux'
        }, {
          id: 1,
          completed: false,
          text: 'Write tests'
        }
      ]))
    ).toMatchObject(Immutable.fromJS([
      {
        text: 'Write tests',
        completed: false,
        id: 1
      }, {
        text: 'Write more tests',
        completed: false,
        id: 2
      }
    ]))
  })
})
