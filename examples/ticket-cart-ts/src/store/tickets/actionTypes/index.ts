import { Ticket } from '../types'

export enum TicketsActionTypes {
  FETCH_TICKETS = 'TICKETS:FETCH',
  FETCH_TICKETS_SUCCESS = 'TICKETS:FETCH_SUCCESS',
  FETCH_TICKETS_FAILURE = 'TICKETS:FETCH_FAILURE'
}

export type LoadTicketsAction = {
  type: TicketsActionTypes.FETCH_TICKETS
}

export type TicketsLoadError = string

export type LoadTicketsFailureAction = {
  type: TicketsActionTypes.FETCH_TICKETS_FAILURE
  payload: { error: TicketsLoadError }
}

export type LoadTicketsSuccessAction = {
  type: TicketsActionTypes.FETCH_TICKETS_SUCCESS
  payload: {
    tickets: Ticket[]
  }
}

export type TicketsAction =
  | LoadTicketsSuccessAction
  | LoadTicketsFailureAction
  | LoadTicketsAction
