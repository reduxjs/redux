import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import App from '../../components/App'
import AddTodo from '../../containers/AddTodo'
import VisibleTodoList from '../../containers/VisibleTodoList'
import UndoRedo from '../../containers/UndoRedo'
import Footer from '../../components/Footer'

function setup() {
  const component = shallow(
    <App />
  )

  return {
    component: component,
    addTodo: component.find(AddTodo),
    visibleTodoList: component.find(VisibleTodoList),
    undoRedo: component.find(UndoRedo),
    footer: component.find(Footer)
  }
}

describe('App component', () => {
  it('should render <AddTodo /> component', () => {
    const { addTodo } = setup()
    expect(addTodo.length).toEqual(1)
  })

  it('should render <VisibleTodoList /> component', () => {
    const { visibleTodoList } = setup()
    expect(visibleTodoList.length).toEqual(1)
  })

  it('should render <Footer /> component', () => {
    const { footer } = setup()
    expect(footer.length).toEqual(1)
  })

  it('should render <UndoRedo /> component', () => {
    const { undoRedo } = setup()
    expect(undoRedo.length).toEqual(1)
  })
})
