import { mapDestinationsToTickets } from './mappers'
import { destinationsListMock, milePriceMock } from './mockData'
import type { Ticket } from '../../store/tickets/types'

export const getTickets: () => Promise<Ticket[]> = async () =>
  mapDestinationsToTickets(destinationsListMock, milePriceMock)

const tickets = {
  getTickets
}

export default tickets
