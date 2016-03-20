import { put, call, select } from 'redux-saga/effects'
import { takeEvery } from 'redux-saga'
import fetch from 'isomorphic-fetch'

import * as actions from '../actions'
import * as selectors from '../reducers/selectors'

export function fetchPosts(reddit) {
  return fetch(`https://www.reddit.com/r/${reddit}.json`)
    .then(response => response.json())
}

function shouldFetchPosts(posts) {
  if (!posts) {
    return true
  }
  if (posts.isFetching) {
    return false
  }
  return posts.didInvalidate
}

export function* fetchPostsIfNeeded({ reddit }) {
  const posts = yield select(selectors.postsByReddit)
  if (shouldFetchPosts(posts[reddit])) {
    yield put(actions.requestPosts(reddit))
    const json = yield call(fetchPosts, reddit)
    const posts = json.data.children.map(child => child.data)
    yield put(actions.receivePosts(reddit, posts))
  }
}

export function* fetchPostsIfNeededWatcher() {
  yield* takeEvery(actions.FETCH_POSTS_IF_NEEDED, fetchPostsIfNeeded)
}
