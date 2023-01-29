/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '(/test/.*\\.spec\\.ts)$',
  coverageProvider: 'v8',
  transform: {
    '\\.ts$': [
      'ts-jest',
      {
        tsconfig: './test/tsconfig.json'
      }
    ]
  }
}
