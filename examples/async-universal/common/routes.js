import React from 'react'
import Route from 'react-router/lib/Route'
import IndexRoute from 'react-router/lib/IndexRoute'

import Reddit from './containers/Reddit'

export default(
  <Route path="/" component={Reddit}>
    <Route path=":id" component={Reddit}/>
  </Route>
)
