import { createSelector } from 'reselect'
import { RootState } from '../../reducers'

export const getTicketsMapById = (state: RootState) =>
  state.tickets.entities.byId
export const getTicketsIds = (state: RootState) => state.tickets.entities.allIds

export const getTickets = createSelector(
  [getTicketsMapById, getTicketsIds],
  (ticketsMapById, ticketsIds) =>
    ticketsIds.map(ticketId => ticketsMapById[ticketId])
)
