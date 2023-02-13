/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '(/test/.*\\.spec\\.ts)$',
  coverageProvider: 'v8',
  moduleNameMapper: {
    '^redux$': '<rootDir>/src/index.ts' // @remap-prod-remove-line
    '^@internal/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '\\.ts$': [
      'ts-jest',
      {
        tsconfig: './test/tsconfig.json'
      }
    ]
  }
}
