import React from 'react'
import { createRenderer } from 'react-test-renderer/shallow';
import Immutable from 'immutable'
import MainSection from './MainSection'
import TodoItem from './TodoItem'
import Footer from './Footer'
import { SHOW_ALL, SHOW_COMPLETED } from '../constants/TodoFilters'

describe('components', () => {
  let output

  const todos = Immutable.fromJS([
    {
      text: 'Use Redux',
      completed: false,
      id: 0
    }, {
      text: 'Run the tests',
      completed: true,
      id: 1
    }
  ])

  const actions = {
      editTodo: jest.fn(),
      deleteTodo: jest.fn(),
      completeTodo: jest.fn(),
      completeAll: jest.fn(),
      clearCompleted: jest.fn()
    }

  const wrapper = (todos, actions) => {
    const renderer = createRenderer()
    renderer.render(<MainSection todos={todos} actions={actions} />)
    return renderer.getRenderOutput()
  }

  beforeEach(() => {
    output = wrapper(todos, actions)
  })

  describe('MainSection', () => {
    it('should render container', () => {      
      expect(output.type).toBe('section')
      expect(output.props.className).toBe('main')
    })

    describe('toggle all input', () => {
      it('should render', () => {
        const [ toggle ] = output.props.children
        expect(toggle.type).toBe('input')
        expect(toggle.props.type).toBe('checkbox')
        expect(toggle.props.checked).toBe(false)
      })

      it('should be checked if all todos completed', () => {
        const index = todos.findIndex(item => {
          return item.get('id') === 0
        })

        const newTodos = todos.update(index, todo => {
          return todo.set('completed', true)
        })

        output = wrapper(newTodos, actions)

        const [ toggle ] = output.props.children
        expect(toggle.props.checked).toBe(true)
      })

      it('should call completeAll on change', () => {
        const [ toggle ] = output.props.children
        toggle.props.onChange({})
        expect(actions.completeAll).toBeCalled()
      })
    })

    describe('footer', () => {
      it('should render', () => {
        const [ , , footer ] = output.props.children
        expect(footer.type).toBe(Footer)
        expect(footer.props.completedCount).toBe(1)
        expect(footer.props.activeCount).toBe(1)
        expect(footer.props.filter).toBe(SHOW_ALL)
      })

      it('onShow should set the filter', () => {
        const { output, renderer } = setup()
        const [ , , footer ] = output.props.children
        footer.props.onShow(SHOW_COMPLETED)
        const updated = renderer.getRenderOutput()
        const [ , , updatedFooter ] = updated.props.children
        expect(updatedFooter.props.filter).toBe(SHOW_COMPLETED)
      })

      it('onClearCompleted should call clearCompleted', () => {
        const { output, props } = setup()
        const [ , , footer ] = output.props.children
        footer.props.onClearCompleted()
        expect(props.actions.clearCompleted).toBeCalled()
      })
    })

    describe('todo list', () => {
      it('should render', () => {
        const { output, props } = setup()
        const [ , list ] = output.props.children
        expect(list.type).toBe('ul')
        expect(list.props.children.length).toBe(2)
        list.props.children.forEach((item, i) => {
          expect(item.type).toBe(TodoItem)
          expect(item.props.todo).toBe(props.todos[i])
        })
      })

      it('should filter items', () => {
        const { output, renderer, props } = setup()
        const [ , , footer ] = output.props.children
        footer.props.onShow(SHOW_COMPLETED)
        const updated = renderer.getRenderOutput()
        const [ , updatedList ] = updated.props.children
        expect(updatedList.props.children.length).toBe(1)
        expect(updatedList.props.children[0].props.todo).toBe(props.todos[1])
      })
    })
  })
})
