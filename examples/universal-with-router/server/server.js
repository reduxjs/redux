/* eslint-disable no-console, no-use-before-define */

import path from 'path'
import Express from 'express'

import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackConfig from '../webpack.config'

import React from 'react'
import {renderToString} from 'react-dom/server'
import {Provider} from 'react-redux'
import {match, RouterContext} from 'react-router'

import configureStore from '../common/store/configureStore'
import {fetchCounter} from '../common/api/counter'
import routes from '../common/routes'

const app = new Express()
const port = 3000

// Use this middleware to set up hot module reloading via webpack.
const compiler = webpack(webpackConfig)
app.use(webpackDevMiddleware(compiler, {
  noInfo: true,
  publicPath: webpackConfig.output.publicPath
}))
app.use(webpackHotMiddleware(compiler))

// This is fired every time the server side receives a request
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

      // Query our mock API asynchronously
      fetchCounter(apiResult => {
        // Read the counter from the request, if provided
        const counter = parseInt(req.params.counter, 10) || apiResult || 0

        // Compile an initial state
        const initialState = {
          counter
        }

        // Create a new Redux store instance
        const store = configureStore(initialState)

        // You can also check renderProps.components or renderProps.routes for
        // your "not found" component or route respectively, and send a 404 as
        // below, if you're using a catch-all route.

        const html = renderToString(
          <Provider store={store}>
            <RouterContext { ...renderProps}/>
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
        <title>Redux Universal Example</title>
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
    console.info(`==> 🌎  Listening on port ${port}. Open up http://localhost:${port}/ in your browser.`)
  }
})
