import deepFreeze from 'deep-freeze'
import reducer from './index'
import { increment, createNode, deleteNode, addChild, removeChild } from '../actions'

describe('reducer', () => {
  it('should provide the initial state', () => {
    expect(reducer(undefined, {})).toEqual({})
  })

  it('should handle INCREMENT action', () => {
    const stateBefore = {
      'node_0': {
        id: 'node_0',
        counter: 0,
        childIds: []
      }
    }
    const action = increment('node_0')
    const stateAfter = {
      'node_0': {
        id: 'node_0',
        counter: 1,
        childIds: []
      }
    }

    deepFreeze(stateBefore)
    deepFreeze(action)

    expect(reducer(stateBefore, action)).toEqual(stateAfter)
  })

  it('should handle CREATE_NODE action', () => {
    const stateBefore = {}
    const action = createNode()
    const stateAfter = {
      [action.nodeId]: {
        id: action.nodeId,
        counter: 0,
        childIds: []
      }
    }

    deepFreeze(stateBefore)
    deepFreeze(action)

    expect(reducer(stateBefore, action)).toEqual(stateAfter)
  })

  it('should handle DELETE_NODE action', () => {
    const stateBefore = {
      'node_0': {
        id: 'node_0',
        counter: 0,
        childIds: [ 'node_1' ]
      },
      'node_1': {
        id: 'node_1',
        counter: 0,
        childIds: []
      },
      'node_2': {
        id: 'node_2',
        counter: 0,
        childIds: [ 'node_3', 'node_4' ]
      },
      'node_3': {
        id: 'node_3',
        counter: 0,
        childIds: []
      },
      'node_4': {
        id: 'node_4',
        counter: 0,
        childIds: []
      }
    }
    const action = deleteNode('node_2')
    const stateAfter = {
      'node_0': {
        id: 'node_0',
        counter: 0,
        childIds: [ 'node_1' ]
      },
      'node_1': {
        id: 'node_1',
        counter: 0,
        childIds: []
      }
    }

    deepFreeze(stateBefore)
    deepFreeze(action)

    expect(reducer(stateBefore, action)).toEqual(stateAfter)
  })

  it('should handle ADD_CHILD action', () => {
    const stateBefore = {
      'node_0': {
        id: 'node_0',
        counter: 0,
        childIds: []
      },
      'node_1': {
        id: 'node_1',
        counter: 0,
        childIds: []
      }
    }
    const action = addChild('node_0', 'node_1')
    const stateAfter = {
      'node_0': {
        id: 'node_0',
        counter: 0,
        childIds: [ 'node_1' ]
      },
      'node_1': {
        id: 'node_1',
        counter: 0,
        childIds: []
      }
    }

    deepFreeze(stateBefore)
    deepFreeze(action)

    expect(reducer(stateBefore, action)).toEqual(stateAfter)
  })

  it('should handle REMOVE_CHILD action', () => {
    const stateBefore = {
      'node_0': {
        id: 'node_0',
        counter: 0,
        childIds: [ 'node_1' ]
      },
      'node_1': {
        id: 'node_1',
        counter: 0,
        childIds: []
      }
    }
    const action = removeChild('node_0', 'node_1')
    const stateAfter = {
      'node_0': {
        id: 'node_0',
        counter: 0,
        childIds: []
      },
      'node_1': {
        id: 'node_1',
        counter: 0,
        childIds: []
      }
    }

    deepFreeze(stateBefore)
    deepFreeze(action)

    expect(reducer(stateBefore, action)).toEqual(stateAfter)
  })
})
