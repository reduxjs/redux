import expect from 'expect'
import reducer from '../../reducers'
import { RECEIVE_POSTS, INVALIDATE_REDDIT, REQUEST_POSTS, SELECT_REDDIT } from '../../actions'

describe('reducer', () => {
  it('should provide the initial state', () => {
    expect(reducer(undefined, {})).toEqual({ postsByReddit: {}, selectedReddit: 'reactjs' })
  })

  it('should handle RECEIVE_POSTS action', () => {
    const action = {
      type: RECEIVE_POSTS,
      reddit: 'reactjs',
      posts: [ 'post 1', 'post 2' ],
      receivedAt: 'now'
    }

    const stateAfter = {
      postsByReddit: {
        reactjs: {
          didInvalidate: false,
          isFetching: false,
          items: [
            'post 1',
            'post 2'
          ],
          lastUpdated: 'now'
        }
      },
      selectedReddit: 'reactjs'
    }

    expect(reducer(undefined, action)).toEqual(stateAfter)
  })

  it('should handle INVALIDATE_REDDIT action', () => {
    const action = {
      type: INVALIDATE_REDDIT,
      reddit: 'reactjs'
    }

    const stateAfter = {
      postsByReddit: {
        reactjs: {
          didInvalidate: true,
          isFetching: false,
          items: []
        }
      },
      selectedReddit: 'reactjs'
    }

    expect(reducer(undefined, action)).toEqual(stateAfter)
  })

  it('should handle REQUEST_POSTS action', () => {
    const action = {
      type: REQUEST_POSTS,
      reddit: 'reactjs'
    }

    const stateAfter = {
      postsByReddit: {
        reactjs: {
          didInvalidate: false,
          isFetching: true,
          items: []
        }
      },
      selectedReddit: 'reactjs'
    }

    expect(reducer(undefined, action)).toEqual(stateAfter)
  })

  it('should handle RECEIVE_POSTS action', () => {
    const action = {
      type: SELECT_REDDIT,
      reddit: 'frontend'
    }

    const stateAfter = {
      postsByReddit: {},
      selectedReddit: 'frontend'
    }

    expect(reducer(undefined, action)).toEqual(stateAfter)
  })
})
