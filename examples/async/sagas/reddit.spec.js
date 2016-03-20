import { take, fork } from 'redux-saga/effects'
import chai from 'chai'
import chaiGen from 'chai-generator'

import { fetchPostsIfNeeded, fetchPostsIfNeededWatcher } from './reddit'
import * as actions from '../actions'

chai.use(chaiGen)
const expect = chai.expect

describe('reddit saga', function () {
  it('should fork fetchPostsIfNeeded on FETCH_POSTS_IF_NEEDED actions', function () {
    const saga = fetchPostsIfNeededWatcher()
    expect(saga).to.deep.yield(take(actions.FETCH_POSTS_IF_NEEDED))
    const action = {}
    expect(saga.next(action)).to.deep.yield(fork(fetchPostsIfNeeded, action))
  })
})
