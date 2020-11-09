import { TicketId, Ticket } from '../../store/tickets/types'
import type { Destination, MilePrice } from './mockData'

export type TicketInfo = {
  id: TicketId
  from: Destination
  to: Destination
}

/**
 * Add price to tickets, the price is calculated by Taxicab geometry
 * https://en.wikipedia.org/wiki/Taxicab_geometry
 */
const mapTicketsInfoToTickets = (
  ticketsInfo: TicketInfo[],
  milePrice: MilePrice
) =>
  ticketsInfo.map(direction => {
    const { from, to } = direction
    const { coordinates: fromCoordinates } = from
    const { coordinates: toCoordinates } = to

    const roadLengthByX = fromCoordinates.x - toCoordinates.x
    const roadLengthByY = fromCoordinates.y - toCoordinates.y
    const roadLength = Math.abs(roadLengthByX) + Math.abs(roadLengthByY)
    const roadPrice = roadLength * milePrice

    const ticket: Ticket = {
      ...direction,
      from: direction.from.title,
      to: direction.from.title,
      price: roadPrice
    }

    return ticket
  })

export const mapDestinationsToTickets = (
  destinations: Destination[],
  milePrice: MilePrice
) => {
  // Simple generation for ticket ids
  let nextId = 1

  const allTicketsInfo: TicketInfo[] = destinations.reduce(
    (acc, currentDestination, index) => {
      const ticketsInfo: TicketInfo[] = destinations
        .slice(index + 1)
        .map(nextDestination => ({
          id: nextId++,
          from: { ...currentDestination },
          to: { ...nextDestination }
        }))
        .concat(acc)

      return ticketsInfo
    },
    [] as TicketInfo[]
  )

  return mapTicketsInfoToTickets(allTicketsInfo, milePrice)
}
