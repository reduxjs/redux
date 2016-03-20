import { put, call, select } from 'redux-saga/effects'
import { takeEvery } from 'redux-saga'
import fetch from 'isomorphic-fetch'

import * as actions from '../actions'

function fetchPosts(reddit) {
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

function* fetchPostsIfNeeded({ reddit }) {
  const posts = yield select(state => state.postsByReddit[reddit])
  if (shouldFetchPosts(posts)) {
    yield put(actions.requestPosts(reddit))
    const json = yield call(fetchPosts, reddit)
    yield put(actions.receivePosts(reddit, json))
  }
}

export function* fetchPostsIfNeededWatcher() {
  yield* takeEvery(actions.FETCH_POSTS_IF_NEEDED, fetchPostsIfNeeded)
}
