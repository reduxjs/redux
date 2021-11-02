const { resolve } = require('path');

const tsConfigPath = resolve('./test/tsconfig');

/** @typedef {import('ts-jest/dist/types')} */
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  rootDir: './test',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: tsConfigPath,
    },
  },
};

module.exports = config;
