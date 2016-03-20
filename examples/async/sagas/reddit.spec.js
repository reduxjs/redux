import { take, put, call, fork, select } from 'redux-saga/effects'
import chai from 'chai'
import chaiGen from 'chai-generator'

import {
  fetchPostsIfNeeded,
  fetchPostsIfNeededWatcher,
  fetchPosts
} from './reddit'
import * as actions from '../actions'
import * as selectors from '../reducers/selectors'

chai.use(chaiGen)
const expect = chai.expect

describe('reddit saga', function () {
  it('should fork fetchPostsIfNeeded on FETCH_POSTS_IF_NEEDED actions', function () {
    const saga = fetchPostsIfNeededWatcher()
    expect(saga).to.deep.yield(take(actions.FETCH_POSTS_IF_NEEDED))
    const action = {}
    expect(saga.next(action)).to.deep.yield(fork(fetchPostsIfNeeded, action))
  })

  it('should fetch posts when there are none', function () {
    const reddit = 'myReddit'
    const action = { reddit }
    const saga = fetchPostsIfNeeded(action)
    expect(saga).to.deep.yield(select(selectors.postsByReddit))

    const postsByReddit = {}
    expect(saga.next(postsByReddit)).to.deep.yield(put(actions.requestPosts(reddit)))

    expect(saga).to.deep.yield(call(fetchPosts, reddit))

    const json = { data: { children: [] } }
    const posts = json.data.children.map(child => child.data)
    expect(saga.next(json)).to.deep.yield(put(actions.receivePosts(reddit, posts)))
  })

  it('should not fetch posts if already fetching', function () {
    const reddit = 'myReddit'
    const action = { reddit }
    const saga = fetchPostsIfNeeded(action)
    expect(saga).to.deep.yield(select(selectors.postsByReddit))

    const postsByReddit = { myReddit: { isFetching: true } }
    expect(saga.next(postsByReddit)).to.return(void 0)
  })

  it('should fetch posts when invalidated', function () {
    const reddit = 'myReddit'
    const action = { reddit }
    const saga = fetchPostsIfNeeded(action)
    expect(saga).to.deep.yield(select(selectors.postsByReddit))

    const postsByReddit = { myReddit: { didInvalidate: true } }
    expect(saga.next(postsByReddit)).to.deep.yield(put(actions.requestPosts(reddit)))

    expect(saga).to.deep.yield(call(fetchPosts, reddit))

    const json = { data: { children: [] } }
    const posts = json.data.children.map(child => child.data)
    expect(saga.next(json)).to.deep.yield(put(actions.receivePosts(reddit, posts)))
  })

  it('should not fetch posts if not invalidated', function () {
    const reddit = 'myReddit'
    const action = { reddit }
    const saga = fetchPostsIfNeeded(action)
    expect(saga).to.deep.yield(select(selectors.postsByReddit))

    const postsByReddit = { myReddit: { didInvalidate: false } }
    expect(saga.next(postsByReddit)).to.return(void 0)
  })
})
