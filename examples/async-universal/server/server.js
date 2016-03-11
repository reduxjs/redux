/* eslint-disable no-console, no-use-before-define */

import path from 'path'
import Express from 'express'

import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import config from '../webpack.config'

import React from 'react'
import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'
import { match, RouterContext } from 'react-router'

import configureStore from '../common/store/configureStore'
import { fetchData } from '../common/api/reddit'
import routes from '../common/routes'

const app = new Express()
const port = 3000

const compiler = webpack(config)
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }))
app.use(webpackHotMiddleware(compiler))

app.use(handleRender)

function handleRender(req, res) {
  match({
    routes,
    location: req.url
  }, (error, redirectLocation, renderProps) => {
    if (error) {
      res.status(500).send(error.message)
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search)
    } else if (renderProps) {

        // Create a new Redux store instance
        const store = configureStore()

        // Grab static fetchData
        const { components, params } = renderProps
        const fetchData = components[ components.length - 1 ].fetchData

        // Query our API asynchronously
        fetchData(store.dispatch, params).then(() => {

          const html = renderToString(
            <Provider store={store}>
              <RouterContext { ...renderProps} />
            </Provider>
          )

          const finalState = store.getState()

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

app.listen(port, (error) => {
  if (error) {
    console.error(error)
  } else {
    console.info("==> 🌎  Listening on port %s. Open up http://localhost:%s/ in your browser.", port, port)
  }
})
