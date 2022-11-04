'use strict';
require('ts-node').register();

const { runTransformTest } = require('codemod-cli');

runTransformTest({
  name: 'createReducerBuilder',
  path: require.resolve('./index.ts'),
  fixtureDir: `${__dirname}/__testfixtures__/`,
});
