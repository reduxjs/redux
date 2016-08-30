import React from 'react'
import { connect } from 'react-redux'
import { addTodo } from '../actions'
import AddTodo from '../components/AddTodo'
import Footer from '../components/Footer'
import VisibleTodoList from './VisibleTodoList'
import FilterLink from './FilterLink'

const App = ({ dispatch }) => (
 <div>
   <AddTodo
      onAddTodo={text => dispatch(addTodo(text))}
    />
   <VisibleTodoList/>
   <Footer>
     <FilterLink filter="SHOW_ALL">
       All
     </FilterLink>
     {", "}
     <FilterLink filter="SHOW_ACTIVE">
       Active
     </FilterLink>
     {", "}
     <FilterLink filter="SHOW_COMPLETED">
       Completed
     </FilterLink>
   </Footer>
 </div>
)

const AppContainer = connect()(App)

export default AppContainer
