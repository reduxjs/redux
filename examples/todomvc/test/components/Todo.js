import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import Todo from '../../components/Todo'

function setup() {
  const actions = {
    editTodo: expect.createSpy(),
    deleteTodo: expect.createSpy(),
    completeTodo: expect.createSpy()
  }

  const todo = {
    id: 0, 
    text: 'Use Redux', 
    complete: false 
  }

  const component = shallow(
    <Todo todo={todo} {...actions} />
  )

  return {
    component: component,
    actions: actions,
    listItem: component.find('li')
  }
}

describe('<Todo />', () => {
  it('should render a list item', () => {
    const { listItem } = setup()
    expect(listItem.length).toEqual(1)
  })

  it('should render a view class when not editing', () => {
    const { component } = setup()
    component.setState({ editing: false })
    const view = component.find('.view')
    const todoTextInput = component.find('TodoTextInput')
    expect(view.length).toEqual(1)
    expect(todoTextInput.length).toEqual(0)
  })

  it('should render a TodoTextInput when editing', () => {
    const { component } = setup()
    component.setState({ editing: true })
    const todoTextInput = component.find('TodoTextInput')
    const view = component.find('.view')
    expect(todoTextInput.length).toEqual(1)
    expect(view.length).toEqual(0)
  })

  it('should render a complete todo checkbox', () => {
    const { component } = setup()
    component.setState({ editing: false })
    const completeCheckbox = component.find('.toggle')
    expect(completeCheckbox.length).toEqual(1)
  })

  it('should call completeTodo when todo checkbox toggled', () => {
    const { actions, component } = setup()
    component.setState({ editing: false })
    const completeCheckbox = component.find('.toggle')
    completeCheckbox.simulate('change')
    expect(actions.completeTodo).toHaveBeenCalled()
  })

  it('should call deleteTodo on click on delete button', () => {
    const { actions, component } = setup()
    component.setState({ editing: false })
    const deleteButton = component.find('.destroy')
    deleteButton.simulate('click')
    expect(actions.deleteTodo).toHaveBeenCalled()
  })

})
