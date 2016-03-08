import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import App from '../../components/App'
import Footer from '../../components/Footer'
import AddTodo from '../../containers/AddTodo'
import VisibleTodoList from '../../containers/VisibleTodoList'

function setup() {
  const component = shallow(
    <App />
  )

  return {
    component: component,
    footer: component.find(Footer),
    addTodo: component.find(AddTodo),
    visibleTodoList: component.find(VisibleTodoList),
    div: component.find('div')
  }
}

describe('<App />', () => {
  it('should render a <Footer /> component', () => {
    const { footer } = setup()
    expect(footer.length).toEqual(1)
  })

  it('should render an <AddTodo /> component', () => {
    const { addTodo } = setup()
    expect(addTodo.length).toEqual(1)
  })

  it('should render a <VisibleTodoList /> component', () => {
    const { visibleTodoList } = setup()
    expect(visibleTodoList.length).toEqual(1)
  })
})
