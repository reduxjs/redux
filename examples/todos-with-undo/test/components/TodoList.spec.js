import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import TodoList from '../../components/TodoList'
import Todo from '../../components/Todo'

function mockItem(overrides) {
  const mock = {
    id: 1,
    completed: false,
    text: 'TodoItem'
  }
  return Object.assign(mock, overrides)
}

function setup(todos=[]) {
  const actions = {
    onTodoClick: expect.createSpy()
  }

  const component = shallow(
    <TodoList todos={todos} {...actions} />
  )

  return {
    component: component,
    actions: actions,
    ul: component.find('ul'),
    todo: component.find(Todo)
  }
}

describe('TodoList component', () => {
  it('should render a single ul tag', () => {
    const { ul } = setup()
    expect(ul.length).toEqual(1)
  })

  it('should render an active todo', () => {
    const items = [ mockItem({ text: 'Todo' }) ]
    const { todo } = setup(items)
    expect(todo.length).toEqual(1)
  })

  it('should render an active and completed todos', () => {
    const items = [ mockItem({ id: 1 }), mockItem({ id: 2, completed: true }) ]
    const { todo } = setup(items)
    expect(todo.length).toEqual(items.length)
    expect(todo.at(0).props().id).toEqual(1)
    expect(todo.at(1).props().id).toEqual(2)
    expect(todo.at(1).props().completed).toEqual(true)
  })

  it('should have a completed todo', () => {
    const items = [ mockItem({ completed: true }) ]
    const { todo } = setup(items)
    expect(todo.length).toEqual(items.length)
    expect(todo.at(0).props().completed).toEqual(true)
  })

  it('should call onTodoClick handler on Todo tag', () => {
    const items = [ mockItem() ]
    const { actions, todo } = setup(items)
    todo.simulate('click')
    expect(actions.onTodoClick).toHaveBeenCalled()
  })
})
