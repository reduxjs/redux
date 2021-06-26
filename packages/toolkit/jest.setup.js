//@ts-ignore
const nodeFetch = require('node-fetch')
//@ts-ignore
global.fetch = nodeFetch
//@ts-ignore
global.Request = nodeFetch.Request
const { server } = require('./src/query/tests/mocks/server')

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

process.on('unhandledRejection', (error) => {
  // eslint-disable-next-line no-undef
  fail(error)
})
