import { all, fork } from 'redux-saga/effects'
import { watchLoadTickets } from './tickets'

export function* rootSaga() {
  yield all([fork(watchLoadTickets)])
}
