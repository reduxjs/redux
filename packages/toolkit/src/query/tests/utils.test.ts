import {
  isOnline,
  isDocumentVisible,
  flatten,
  joinUrls,
} from '@internal/query/utils'

afterAll(() => {
  jest.restoreAllMocks()
})

describe('isOnline', () => {
  test('Assumes online=true in a node env', () => {
    jest
      .spyOn(window, 'navigator', 'get')
      .mockImplementation(() => undefined as any)

    expect(navigator).toBeUndefined()
    expect(isOnline()).toBe(true)
  })

  test('Returns false if navigator isOnline=false', () => {
    jest
      .spyOn(window, 'navigator', 'get')
      .mockImplementation(() => ({ onLine: false } as any))
    expect(isOnline()).toBe(false)
  })

  test('Returns true if navigator isOnline=true', () => {
    jest
      .spyOn(window, 'navigator', 'get')
      .mockImplementation(() => ({ onLine: true } as any))
    expect(isOnline()).toBe(true)
  })
})

describe('isDocumentVisible', () => {
  test('Assumes true when in a non-browser env', () => {
    jest
      .spyOn(window, 'document', 'get')
      .mockImplementation(() => undefined as any)
    expect(window.document).toBeUndefined()
    expect(isDocumentVisible()).toBe(true)
  })

  test('Returns false when hidden=true', () => {
    jest
      .spyOn(window, 'document', 'get')
      .mockImplementation(() => ({ visibilityState: 'hidden' } as any))
    expect(isDocumentVisible()).toBe(false)
  })

  test('Returns true when visibilityState=prerender', () => {
    jest
      .spyOn(window, 'document', 'get')
      .mockImplementation(() => ({ visibilityState: 'prerender' } as any))
    expect(document.visibilityState).toBe('prerender')
    expect(isDocumentVisible()).toBe(true)
  })
  test('Returns true when visibilityState=visible', () => {
    jest
      .spyOn(window, 'document', 'get')
      .mockImplementation(() => ({ visibilityState: 'visible' } as any))
    expect(document.visibilityState).toBe('visible')
    expect(isDocumentVisible()).toBe(true)
  })
  test('Returns true when visibilityState=undefined', () => {
    jest
      .spyOn(window, 'document', 'get')
      .mockImplementation(() => ({ visibilityState: undefined } as any))
    expect(document.visibilityState).toBeUndefined()
    expect(isDocumentVisible()).toBe(true)
  })
})

describe('joinUrls', () => {
  test('correctly joins variations of relative urls', () => {
    expect(joinUrls('/api/', '/banana')).toBe('/api/banana')
    expect(joinUrls('/api/', 'banana')).toBe('/api/banana')

    expect(joinUrls('/api', 'banana')).toBe('/api/banana')
    expect(joinUrls('/api', '/banana/')).toBe('/api/banana/')

    expect(joinUrls('', '/banana')).toBe('/banana')
    expect(joinUrls('', 'banana')).toBe('banana')
  })

  test('correctly joins variations of absolute urls', () => {
    expect(joinUrls('https://example.com/api', 'banana')).toBe(
      'https://example.com/api/banana'
    )
    expect(joinUrls('https://example.com/api', '/banana')).toBe(
      'https://example.com/api/banana'
    )

    expect(joinUrls('https://example.com/api/', 'banana')).toBe(
      'https://example.com/api/banana'
    )
    expect(joinUrls('https://example.com/api/', '/banana/')).toBe(
      'https://example.com/api/banana/'
    )
  })
})

describe('flatten', () => {
  test('flattens an array to a depth of 1', () => {
    expect(flatten([1, 2, [3, 4]])).toEqual([1, 2, 3, 4])
  })
  test('does not flatten to a depth of 2', () => {
    const flattenResult = flatten([1, 2, [3, 4, [5, 6]]])
    expect(flattenResult).not.toEqual([1, 2, 3, 4, 5, 6])
    expect(flattenResult).toEqual([1, 2, 3, 4, [5, 6]])
  })
})
