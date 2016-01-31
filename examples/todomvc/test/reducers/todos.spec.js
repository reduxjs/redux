import expect from 'expect'
import todos from '../../reducers/todos'

describe('todos reducer', () => {
  it('should handle initial state', () => {
    expect(
      todos(undefined, {})
    ).toEqual([
      {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ])
  })

  it('should handle ADD_TODO', () => {
    expect(
      todos([], {
        type: 'ADD_TODO',
        text: 'Run the tests'
      })
    ).toEqual([
      {
        text: 'Run the tests',
        completed: false,
        id: 0
      }
    ])

    expect(
      todos([
        {
          text: 'Use Redux',
          completed: false,
          id: 0
        }
      ], {
        type: 'ADD_TODO',
        text: 'Run the tests'
      })
    ).toEqual([
      {
        text: 'Run the tests',
        completed: false,
        id: 1
      }, {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ])

    expect(
      todos([
        {
          text: 'Run the tests',
          completed: false,
          id: 1
        }, {
          text: 'Use Redux',
          completed: false,
          id: 0
        }
      ], {
        type: 'ADD_TODO',
        text: 'Fix the tests'
      })
    ).toEqual([
      {
        text: 'Fix the tests',
        completed: false,
        id: 2
      }, {
        text: 'Run the tests',
        completed: false,
        id: 1
      }, {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ])
  })

  it('should handle TOGGLE_TODO', () => {
    expect(
      todos([
        {
          text: 'Run the tests',
          completed: false,
          id: 1
        }, {
          text: 'Use Redux',
          completed: false,
          id: 0
        }
      ], {
        type: 'TOGGLE_TODO',
        id: 1
      })
    ).toEqual([
      {
        text: 'Run the tests',
        completed: true,
        id: 1
      }, {
        text: 'Use Redux',
        completed: false,
        id: 0
      }
    ])
  })

  // it('should not generate duplicate ids after CLEAR_COMPLETED', () => {
  //   expect(
  //     [
  //       {
  //         type: types.COMPLETE_TODO,
  //         id: 0
  //       }, {
  //         type: types.CLEAR_COMPLETED
  //       }, {
  //         type: types.ADD_TODO,
  //         text: 'Write more tests'
  //       }
  //     ].reduce(todos, [
  //       {
  //         id: 0,
  //         completed: false,
  //         text: 'Use Redux'
  //       }, {
  //         id: 1,
  //         completed: false,
  //         text: 'Write tests'
  //       }
  //     ])
  //   ).toEqual([
  //     {
  //       text: 'Write more tests',
  //       completed: false,
  //       id: 2
  //     }, {
  //       text: 'Write tests',
  //       completed: false,
  //       id: 1
  //     }
  //   ])
  // })
})
