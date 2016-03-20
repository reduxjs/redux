export const REQUEST_POSTS = 'REQUEST_POSTS'
export const RECEIVE_POSTS = 'RECEIVE_POSTS'
export const SELECT_REDDIT = 'SELECT_REDDIT'
export const INVALIDATE_REDDIT = 'INVALIDATE_REDDIT'
export const FETCH_POSTS_IF_NEEDED = 'FETCH_POSTS_IF_NEEDED'

export function selectReddit(reddit) {
  return {
    type: SELECT_REDDIT,
    reddit
  }
}

export function invalidateReddit(reddit) {
  return {
    type: INVALIDATE_REDDIT,
    reddit
  }
}

export function requestPosts(reddit) {
  return {
    type: REQUEST_POSTS,
    reddit
  }
}

export function receivePosts(reddit, posts) {
  return {
    type: RECEIVE_POSTS,
    reddit,
    posts,
    receivedAt: Date.now()
  }
}

export function fetchPostsIfNeeded(reddit) {
  return {
    type: FETCH_POSTS_IF_NEEDED,
    reddit
  }
}
