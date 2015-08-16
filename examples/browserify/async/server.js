var express = require('express');
var browserify = require('browserify-middleware');

var app = express();

app.get('/static/bundle.js', browserify(
  __dirname + '/index.js',
  {
    transform: [
      require('babelify'),
      [require('aliasify'), {aliases: {'redux': require.resolve('../../../src')}}]
    ]
  }
));

app.get('/', function (req, res, next) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(3000, 'localhost', function (err) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at localhost:3000');
});
