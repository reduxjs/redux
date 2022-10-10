'use strict';

const { runTransformTest } = require('codemod-cli');

runTransformTest({ 
  name: 'createReducerBuilder',
  path: require.resolve('./index.js'),
  fixtureDir: `${__dirname}/__testfixtures__/`,
});