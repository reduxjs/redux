var babel = require('babel');

module.exports = function wallabyConfig(wallaby) {
  var babelCompiler = wallaby.compilers.babel({ babel: babel, stage: 0 });

  return {
    debug: true,
    files: [
      'src/**/*.js',
      'test/helpers/*.js',
    ],

    tests: [
      'test/**/*.spec.js',
    ],

    compilers: {
      'src/**/*.js': babelCompiler,
      'test/**/*.js': babelCompiler,
    },

    env: {
      type: 'node',
    },

    testFramework: 'mocha',
  };
};
