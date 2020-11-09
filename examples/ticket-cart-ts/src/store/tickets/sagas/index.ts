import { SagaIterator } from 'redux-saga'
import { put, call, takeLatest, delay } from 'redux-saga/effects'
import { ticketsActions } from '../actions'
import { TicketsActionTypes } from '../actionTypes'
import api from '../../../api'

function* loadTickets(): SagaIterator<void> {
  try {
    yield delay(1000)

    const tickets = yield call(api.tickets.getTickets)

    yield put(ticketsActions.loadTicketsSuccess(tickets))
  } catch (error) {
    yield put(ticketsActions.loadTicketsFailure((error as Error).message))
  }
}

export function* watchLoadTickets() {
  yield takeLatest(TicketsActionTypes.FETCH_TICKETS, loadTickets)
}
