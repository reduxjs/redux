import { TicketsActionTypes } from '../actionTypes'
import type {
  TicketsLoadError,
  LoadTicketsAction,
  LoadTicketsFailureAction,
  LoadTicketsSuccessAction
} from '../actionTypes'
import { Ticket } from '../types'

function loadTickets(): LoadTicketsAction {
  return {
    type: TicketsActionTypes.FETCH_TICKETS
  }
}

function loadTicketsSuccess(tickets: Ticket[]): LoadTicketsSuccessAction {
  return {
    type: TicketsActionTypes.FETCH_TICKETS_SUCCESS,
    payload: { tickets }
  }
}

function loadTicketsFailure(error: TicketsLoadError): LoadTicketsFailureAction {
  return {
    type: TicketsActionTypes.FETCH_TICKETS_FAILURE,
    payload: {
      error
    }
  }
}

export const ticketsActions = {
  loadTickets,
  loadTicketsSuccess,
  loadTicketsFailure
}
