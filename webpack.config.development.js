'use strict';

var _ = require('lodash');
var webpack = require('webpack');
var baseConfig = require('./webpack.config.base');

module.exports = _.merge({}, baseConfig, {
  plugins: baseConfig.plugins.concat(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    })
  )
});
