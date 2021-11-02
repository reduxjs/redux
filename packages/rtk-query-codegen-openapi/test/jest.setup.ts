global.fetch = require('node-fetch');
const { format } = require('prettier');
const { server } = require('./mocks/server');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

expect.addSnapshotSerializer({
  test: (val) => typeof val === 'string',
  print: (val) => {
    return val as string;
  },
});

expect.addSnapshotSerializer({
  serialize(val) {
    return format(val, {
      parser: 'typescript',
      endOfLine: 'auto',
      printWidth: 120,
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
    });
  },
  test: (val) => /injectEndpoints/.test(val),
});
