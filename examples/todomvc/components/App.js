import React from 'react'
import Header from '../containers/Header'
import VisibleTodoList from '../containers/VisibleTodoList'
import Footer from '../containers/FooterNav'

const App = () => (
  <div>
    <Header />
    <VisibleTodoList />
    <Footer />
  </div>
)

export default App
