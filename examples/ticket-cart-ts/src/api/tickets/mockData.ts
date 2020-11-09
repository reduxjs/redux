export type MilePrice = number

export const milePriceMock: MilePrice = 10

export type DestinationId = number

type DestinationCoordinates = {
  x: number
  y: number
}

type DestinationTitle = string

export type Destination = {
  id: DestinationId
  title: DestinationTitle
  coordinates: DestinationCoordinates
}

export const destinationsListMock: Destination[] = [
  {
    id: 1,
    title: 'Destination 1',
    coordinates: {
      x: 1,
      y: 1
    }
  },
  {
    id: 2,
    title: 'Destination 2',
    coordinates: {
      x: 5,
      y: 3
    }
  },
  {
    id: 3,
    title: 'Destination 3',
    coordinates: {
      x: 7,
      y: 2
    }
  },
  {
    id: 4,
    title: 'Destination 4',
    coordinates: {
      x: 8,
      y: 4
    }
  },
  {
    id: 5,
    title: 'Destination 5',
    coordinates: {
      x: 6,
      y: 9
    }
  }
]
