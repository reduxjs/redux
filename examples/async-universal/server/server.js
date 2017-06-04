var webpack = require('webpack')
var webpackDevMiddleware = require('webpack-dev-middleware')
var webpackHotMiddleware = require('webpack-hot-middleware')
var config = require('../webpack.config')
var React = require('react')
var renderToString = require('react-dom/server').renderToString
var Provider = require('react-redux').Provider
var match = require('react-router/lib/match')
var RouterContext = require('react-router/lib/RouterContext')

var configureStore = require('../common/store/configureStore').default
var routes = require('../common/routes').default

var app = new (require('express'))()
var port = 3000

var compiler = webpack(config)
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }))
app.use(webpackHotMiddleware(compiler))

app.use(handleRender)

function handleRender(req, res) {
  match({ routes, location: req.url }, function(error, redirectLocation, renderProps) {
    if (error) {
      res.status(500).send(error.message)
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search)
    } else if (renderProps) {
      // Create a new Redux store instance
      var store = configureStore()

      // Grab static fetchData
      var fetchData = renderProps.components[ renderProps.components.length - 1 ].fetchData

      // Query our API asynchronously
      fetchData(store.dispatch, renderProps.params).then(() => {

        const html = renderToString(
          <Provider store={store}>
            <RouterContext { ...renderProps} />
          </Provider>
        )

        var finalState = store.getState()

        res.status(200).send(renderFullPage(html, finalState))
      })

    } else {
      res.status(404).send('Not found')
    }
  })
}

function renderFullPage(html, initialState) {
  return `
    <!doctype html>
    <html>
      <head>
        <title>Redux Async Universal Example</title>
      </head>
      <body>
        <div id="app">${html}</div>
        <script>
          window.__INITIAL_STATE__ = ${JSON.stringify(initialState)}
        </script>
        <script src="/static/bundle.js"></script>
      </body>
    </html>
    `
}

app.listen(port, function(error) {
  if (error) {
    console.error(error)
  } else {
    console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port)
  }
})
