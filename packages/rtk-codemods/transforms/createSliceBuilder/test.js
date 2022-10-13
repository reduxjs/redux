'use strict';

const { runTransformTest } = require('codemod-cli');

runTransformTest({
  name: 'createSliceBuilder',
  path: require.resolve('./index.ts'),
  fixtureDir: `${__dirname}/__testfixtures__/`,
});
