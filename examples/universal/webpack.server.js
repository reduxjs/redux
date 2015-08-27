/* eslint-disable no-console */

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  headers: {'Access-Control-Allow-Origin': '*'},
  stats: {
    colors: true
  }
}).listen(3000, 'localhost', function errorCallback(err) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at localhost:3000');
});
