module.exports = {
  setupFilesAfterEnv: ['./jest.setup.js'],
  testMatch: ['<rootDir>/src/**/*.(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    '^@reduxjs/toolkit$': '<rootDir>/src/index.ts', // @remap-prod-remove-line
    '^@reduxjs/toolkit/query$': '<rootDir>/src/query/index.ts', // @remap-prod-remove-line
    '^@reduxjs/toolkit/query/react$': '<rootDir>/src/query/react/index.ts', // @remap-prod-remove-line
    // this mapping is disabled as we want `dist` imports in the tests only to be used for "type-only" imports which don't play a role for jest
    //'^@reduxjs/toolkit/dist/(.*)$': '<rootDir>/src/*',
    '^@internal/(.*)$': '<rootDir>/src/$1',
  },
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
      diagnostics: {
        ignoreCodes: [6133],
      },
    },
  },
}
