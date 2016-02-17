import React from 'react'
import Route from 'react-router/lib/Route'
import IndexRoute from 'react-router/lib/IndexRoute'
import Redirect from 'react-router/lib/Redirect'

import Layout from './components/Layout'
import Home from './components/Home'
import Sample from './components/Sample'
import Reddit from './containers/Reddit'
import Test from './components/Test'

export default (
      <Route path="/" component={Layout}>
        <IndexRoute component={Home} />
        <Route path="sample" component={Sample} />
        <Redirect from="reddit" to="reddit/reactjs" />
        <Route path="reddit/:id" component={Reddit} />
      </Route>
  )
