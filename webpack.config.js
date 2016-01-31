'use strict';
var webpack = require('webpack');

var nodeEnv = process.env.NODE_ENV;
var config = {
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ }
    ]
  },
  output: {
    library: 'Redux',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['', '.js']
  },
  plugins : [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(nodeEnv)
    })    
  ]
};

if (nodeEnv == 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    })
  )
}

module.exports = config;
