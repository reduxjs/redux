import { fork } from 'redux-saga/effects'
import { fetchPostsIfNeededWatcher } from './reddit'

export default function* rootSaga() {
  yield fork(fetchPostsIfNeededWatcher)
}
