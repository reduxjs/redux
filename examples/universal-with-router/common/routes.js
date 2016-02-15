import React from 'react'
import { Route, IndexRoute } from 'react-router'

import Layout from './components/Layout'
import Home from './components/Home'
import Sample from './components/Sample'
import Counter from './containers/Counter'

export default (
      <Route path="/" component={Layout}>
        <IndexRoute component={Home}/>
        <Route path="sample" component={Sample}/>
        <Route path="counter" component={Counter}/>
      </Route>
  )
