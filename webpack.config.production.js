'use strict';

var _ = require('lodash');
var webpack = require('webpack');
var baseConfig = require('./webpack.config.base');

module.exports = _.merge({}, baseConfig, {
  plugins: baseConfig.plugins.concat(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true,
        warnings: false
      }
    })
  )
});
