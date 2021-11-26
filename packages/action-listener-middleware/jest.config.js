module.exports = {
  testMatch: ['<rootDir>/src/**/*.(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    '^@reduxjs/toolkit$': '<rootDir>/../toolkit/src/index.ts', // @remap-prod-remove-line
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
