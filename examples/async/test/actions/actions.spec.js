import expect from 'expect'
import fetchMock from 'fetch-mock'
import { fetchPostsIfNeeded } from '../../actions'

function setup(reddit = 'reactjs') {
  const dispatch = expect.createSpy()
  const getState = expect.createSpy()

  const actionCreator = fetchPostsIfNeeded(reddit)

  const response = {
    body: JSON.stringify({
      data: {
        children: [
          { data: 'post 1' },
          { data: 'post 2' }
        ]
      }
    })
  }

  fetchMock.mock(`https://www.reddit.com/r/${reddit}.json`, response)

  return {
    actionCreator: actionCreator,
    dispatch: dispatch,
    getState: getState
  }
}

function callThroughWithDispatch(dispatch) {
  return dispatch.calls[0].arguments[0](dispatch)
}

describe('fetchPostsIfNeeded action', () => {
  afterEach(() => {
    fetchMock.restore()
  })

  it('should dispatch REQUEST_POSTS action', () => {
    const { actionCreator, dispatch, getState } = setup()

    getState.andReturn({
      postsByReddit: {}
    })

    actionCreator(dispatch, getState)

    callThroughWithDispatch(dispatch)

    expect(dispatch).toHaveBeenCalledWith({
      type: 'REQUEST_POSTS',
      reddit: 'reactjs'
    })
  })

  it('should dispatch RECEIVE_POSTS action', () => {
    const { actionCreator, dispatch, getState } = setup()

    getState.andReturn({
      postsByReddit: {}
    })

    actionCreator(dispatch, getState)

    return callThroughWithDispatch(dispatch)
      .then(() => {
        const { type, reddit, posts } = dispatch.calls[2].arguments[0]

        const action = { type, reddit, posts }

        expect(action).toEqual({
          type: 'RECEIVE_POSTS',
          reddit: 'reactjs',
          posts: [ 'post 1', 'post 2' ]
        })
      })
  })

  describe('when fetching', () => {
    it('should not dispatch REQUEST_POSTS action', () => {
      const { actionCreator, dispatch, getState } = setup()

      getState.andReturn({
        postsByReddit: {
          reactjs: {
            isFetching: true
          }
        }
      })

      actionCreator(dispatch, getState)

      expect(dispatch).toNotHaveBeenCalled()
    })
  })

  describe('when existing posts', () => {
    it('should not dispatch REQUEST_POSTS action', () => {
      const { actionCreator, dispatch, getState } = setup()

      getState.andReturn({
        postsByReddit: {
          reactjs: {
            posts: [ 'post 3', 'post 4' ]
          }
        }
      })

      actionCreator(dispatch, getState)

      expect(dispatch).toNotHaveBeenCalled()
    })

    describe('when invalidated', () => {
      it('should dispatch REQUEST_POSTS action', () => {
        const { actionCreator, dispatch, getState } = setup()

        getState.andReturn({
          postsByReddit: {
            reactjs: {
              posts: [ 'post 3', 'post 4' ],
              didInvalidate: true
            }
          }
        })

        actionCreator(dispatch, getState)

        callThroughWithDispatch(dispatch)

        expect(dispatch).toHaveBeenCalledWith({
          type: 'REQUEST_POSTS',
          reddit: 'reactjs'
        })
      })

      it('should dispatch RECEIVE_POSTS action', () => {
        const { actionCreator, dispatch, getState } = setup()

        getState.andReturn({
          postsByReddit: {
            reactjs: {
              posts: [ 'post 3', 'post 4' ],
              didInvalidate: true
            }
          }
        })

        actionCreator(dispatch, getState)

        return callThroughWithDispatch(dispatch)
          .then(() => {
            const { type, reddit, posts } = dispatch.calls[2].arguments[0]

            const action = { type, reddit, posts }

            expect(action).toEqual({
              type: 'RECEIVE_POSTS',
              reddit: 'reactjs',
              posts: [ 'post 1', 'post 2' ]
            })
          })
      })
    })
  })
})
