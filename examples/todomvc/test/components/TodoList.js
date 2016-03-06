import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import TodoList from '../../components/TodoList'

function setup() {
  const actions = {
    editTodo: expect.createSpy(),
    deleteTodo: expect.createSpy(),
    completeTodo: expect.createSpy(),
    completeAll: expect.createSpy()
  }

  const todos = [
    {
      id: 0, 
      text: 'Use Redux', 
      completed: false 
    }
  ]

  const component = shallow(
    <TodoList todos={todos} completedCount={0} {...actions} />
  )

  return {
    component: component,
    actions: actions,
    toggleAll: component.find('.toggle-all'),
    todoList: component.find('.todo-list')
  }
}

describe('<TodoList />', () => {
  it('should render a toggle all input', () => {
    const { toggleAll } = setup()
    expect(toggleAll.length).toEqual(1)
  })

  it('should call completeAll when toggle all input changed', () => {
    const { actions, toggleAll } = setup()
    toggleAll.simulate('change')
    expect(actions.completeAll).toHaveBeenCalled()
  })

  it('should render a todo list', () => {
    const { todoList } = setup()
    expect(todoList.length).toEqual(1)
  })

  it('should render a list of todos', () => {
    const { todoList } = setup()
    expect(todoList.find('Todo').at(0).length).toEqual(1)
  })
})
