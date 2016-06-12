import fetch from 'isomorphic-fetch'

export function selectReddit(reddit) {
  return {
    type: 'SELECT_REDDIT',
    reddit
  }
}

export function invalidateReddit(reddit) {
  return {
    type: 'INVALIDATE_REDDIT',
    reddit
  }
}

function requestPosts(reddit) {
  return {
    type: 'REQUEST_POSTS',
    reddit
  }
}

function receivePosts(reddit, json) {
  return {
    type: 'RECEIVE_POSTS',
    posts: json.data.children.map(child => child.data),
    receivedAt: Date.now(),
    reddit
  }
}

function fetchPosts(reddit) {
  return dispatch => {
    dispatch(requestPosts(reddit))
    return fetch(`https://www.reddit.com/r/${reddit}.json`)
      .then(response => response.json())
      .then(json => dispatch(receivePosts(reddit, json)))
  }
}

function shouldFetchPosts(state, reddit) {
  const posts = state.postsByReddit[reddit]
  if (!posts) {
    return true
  }
  if (posts.isFetching) {
    return false
  }
  return posts.didInvalidate
}

export function fetchPostsIfNeeded(reddit) {
  return (dispatch, getState) => {
    if (shouldFetchPosts(getState(), reddit)) {
      return dispatch(fetchPosts(reddit))
    }
  }
}
