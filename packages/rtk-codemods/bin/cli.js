#!/usr/bin/env node
const path = require('path');

require('ts-node').register({
  project: path.join(__dirname, './tsconfig.json'),
});

require('codemod-cli').runTransform(
  __dirname,
  process.argv[2] /* transform name */,
  process.argv.slice(3) /* paths or globs */
);
