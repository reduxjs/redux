import React from 'react'
import Route from 'react-router/lib/Route'
import IndexRoute from 'react-router/lib/IndexRoute'

import Layout from './components/Layout'
import Reddit from './containers/Reddit'

export default(
  <Route path="/" component={Layout}>
    <IndexRoute component={Reddit}/>
    <Route path=":id" component={Reddit}/>
  </Route>
)
