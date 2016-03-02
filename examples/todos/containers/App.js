import React from 'react'
import Footer from '../components/Footer'
import AddTodo from './AddTodo'
import VisibleTodoList from './VisibleTodoList'

const App = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
)

export default App
