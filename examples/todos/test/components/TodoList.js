import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import TodoList from '../../components/TodoList'
import Todo from '../../components/Todo'

function setup() {
  const actions = {
    onTodoClick: expect.createSpy()
  }

  const todos = [
    {
      id: 0,
      completed: false,
      text: 'Use Redux'
    }
  ]

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

describe('<TodoList />', () => {
  it('should render a single ul tag', () => {
    const { ul } = setup()
    expect(ul.length).toEqual(1)
  })

  it('should render a <Todo /> for each todo', () => {
    const { todo } = setup()
    expect(todo.length).toEqual(1)
  })

  it('should call onTodoClick when Todo is clicked', () => {
    const { actions, todo } = setup()
    todo.props().onClick()
    expect(actions.onTodoClick).toHaveBeenCalled()
  })
})
