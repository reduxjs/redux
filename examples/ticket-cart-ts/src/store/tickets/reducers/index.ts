import { TicketsActionTypes, TicketsLoadError } from '../actionTypes'
import type { TicketsAction } from '../actionTypes'
import { TicketId, Ticket } from '../types'

export enum TicketsLoadStatus {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export type TicketsMapById = Record<TicketId, Ticket>

export type TicketsState = {
  ticketsLoadStatus: TicketsLoadStatus
  error: TicketsLoadError
  entities: {
    byId: TicketsMapById
    allIds: TicketId[]
  }
}

const initialState: TicketsState = {
  ticketsLoadStatus: TicketsLoadStatus.IDLE,
  error: '',
  entities: {
    byId: {},
    allIds: []
  }
}

function loadTicketsReducer(
  state: TicketsState,
  action: TicketsAction
): TicketsState {
  switch (action.type) {
    case TicketsActionTypes.FETCH_TICKETS: {
      return {
        ...state,
        ticketsLoadStatus: TicketsLoadStatus.PENDING,
        error: ''
      }
    }

    default:
      return state
  }
}

function loadTicketsPendingReducer(
  state: TicketsState,
  action: TicketsAction
): TicketsState {
  switch (action.type) {
    case TicketsActionTypes.FETCH_TICKETS_SUCCESS: {
      const { tickets } = action.payload
      const ticketsMapById = tickets.reduce(
        (ticketsMap, ticket) => ({
          ...ticketsMap,
          [ticket.id]: ticket
        }),
        {}
      )
      const ticketsIds = tickets.map(ticket => ticket.id)

      return {
        ...state,
        ticketsLoadStatus: TicketsLoadStatus.READY,
        entities: {
          byId: ticketsMapById,
          allIds: ticketsIds
        }
      }
    }

    case TicketsActionTypes.FETCH_TICKETS_FAILURE: {
      return {
        ...state,
        ticketsLoadStatus: TicketsLoadStatus.ERROR,
        error: action.payload.error
      }
    }

    default:
      return state
  }
}

export function ticketsReducer(
  state: TicketsState = initialState,
  action: TicketsAction
): TicketsState {
  switch (state.ticketsLoadStatus) {
    case TicketsLoadStatus.IDLE:
    case TicketsLoadStatus.ERROR:
      return loadTicketsReducer(state, action)
    case TicketsLoadStatus.PENDING:
      return loadTicketsPendingReducer(state, action)

    default:
      return state
  }
}
