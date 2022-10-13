#!/usr/bin/env node

require('ts-node').register();

require('codemod-cli').runTransform(
  __dirname,
  process.argv[2] /* transform name */,
  process.argv.slice(3) /* paths or globs */
);
