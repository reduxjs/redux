// Karma configuration
// Generated on Thu Feb 25 2016 15:03:11 GMT+1100 (AEDT)
var webpack = require('karma-webpack')
var path = require('path')

module.exports = function(config) {
  config.set({
    // list of files / patterns to load in the browser
    files: [
      'tests.webpack.js' // just load this file
    ],
    preprocessors: {
      'tests.webpack.js': [ 'webpack', 'sourcemap' ]
    },
    reporters: [ 'mocha', 'coverage' ],
    coverageReporter: {
      dir: 'build/reports/coverage',
      reporters: [
        { type: 'html', subdir: 'report-html' },
        { type: 'lcov', subdir: 'report-lcov' },
        { type: 'cobertura', subdir: '.', file: 'cobertura.txt' }
      ]
    },
    webpack: {
      devtool: 'inline-source-map',
      module: {

        loaders: [{
          test: /\.(js|jsx)$/, exclude: /(bower_components|node_modules)/,
          //loader: 'babel?presets[]=react,presets[]=es2015,presets[]=stage-0,plugins[]=transform-runtime,plugins[]=transform-decorators-legacy'
          loader: 'babel',
        },
        {
          test: /\.(js|jsx)$/,
          include: path.resolve('src/'),
          loader: 'isparta'
        }]/*,
        postLoaders: [{
          test: /\.(js|jsx)$/, exclude: /(node_modules|bower_components|tests)/,
          loader: 'istanbul-instrumenter'
        }]*/
      }
    }/*,
    resolve: {
      alias: {
        'sinon': 'sinon/pkg/sinon'
      }
    }*/,
    webpackMiddleware: { noInfo: true },

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'sinon'],



    // list of files to exclude
    exclude: [
    ],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
