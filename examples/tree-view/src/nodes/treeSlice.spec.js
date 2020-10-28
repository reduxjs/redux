import deepFreeze from 'deep-freeze'
import reducer, {
  addChildToNode,
  increment,
  removeNodeByParent
} from './treeSlice'

describe('reducer', () => {
  it('should provide the initial state', () => {
    expect(reducer(undefined, {})).toEqual({})
  })

  it('should handle increment action', () => {
    const stateBefore = {
      node_0: {
        id: 'node_0',
        counter: 0,
        childIds: []
      }
    }
    const action = increment('node_0')
    const stateAfter = {
      node_0: {
        id: 'node_0',
        counter: 1,
        childIds: []
      }
    }

    deepFreeze(stateBefore)
    deepFreeze(action)

    expect(reducer(stateBefore, action)).toEqual(stateAfter)
  })

  it('should handle removeNodeByParent action', () => {
    const stateBefore = {
      node_0: {
        id: 'node_0',
        counter: 0,
        childIds: ['node_1', 'node_2']
      },
      node_1: {
        id: 'node_1',
        counter: 0,
        childIds: []
      },
      node_2: {
        id: 'node_2',
        counter: 0,
        childIds: ['node_3', 'node_4']
      },
      node_3: {
        id: 'node_3',
        counter: 0,
        childIds: []
      },
      node_4: {
        id: 'node_4',
        counter: 0,
        childIds: []
      }
    }
    const action = removeNodeByParent({ parentId: 'node_0', childId: 'node_2' })
    const stateAfter = {
      node_0: {
        id: 'node_0',
        counter: 0,
        childIds: ['node_1']
      },
      node_1: {
        id: 'node_1',
        counter: 0,
        childIds: []
      }
    }

    deepFreeze(stateBefore)
    deepFreeze(action)

    expect(reducer(stateBefore, action)).toEqual(stateAfter)
  })

  it('should handle addChildToNode action', () => {
    const stateBefore = {
      node_0: {
        id: 'node_0',
        counter: 0,
        childIds: []
      }
    }
    const action = addChildToNode('node_0')
    const stateAfter = {
      node_0: {
        id: 'node_0',
        counter: 0,
        childIds: ['node_1']
      },
      node_1: {
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
