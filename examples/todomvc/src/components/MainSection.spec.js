import React from 'react'
import TestUtils from 'react-addons-test-utils'
import MainSection from './MainSection'
import { SHOW_COMPLETED } from '../constants/TodoFilters'

const setup = propOverrides => {
  const props = Object.assign({
    todos: [
      {
        text: 'Use Redux',
        completed: false,
        id: 0
      }, {
        text: 'Run the tests',
        completed: true,
        id: 1
      }
    ],
    actions: {
      editTodo: jest.fn(),
      deleteTodo: jest.fn(),
      completeTodo: jest.fn(),
      completeAll: jest.fn(),
      clearCompleted: jest.fn()
    }
  }, propOverrides)

  const renderer = TestUtils.createRenderer()
  renderer.render(<MainSection {...props} />)
  const output = renderer.getRenderOutput()

  return {
    props: props,
    output: output,
    renderer: renderer
  }
}

describe('components', () => {
  describe('MainSection', () => {
    it('should render container whole MainSection', () => {
      const { output } = setup()
      expect(output).toMatchSnapshot()
    })

    describe('toggle all input', () => {
      it('should be checked if all todos completed', () => {
        const { output } = setup({ todos: [
          {
            text: 'Use Redux',
            completed: true,
            id: 0
          }
        ]
        })
        const [ toggle ] = output.props.children
        expect(toggle).toMatchSnapshot()
      })

      it('should call completeAll on change', () => {
        const { output, props } = setup()
        const [ toggle ] = output.props.children
        toggle.props.onChange({})
        expect(props.actions.completeAll).toBeCalled()
      })
    })

    describe('footer', () => {
      it('onShow should set the filter', () => {
        const { output, renderer } = setup()
        const [ , , footer ] = output.props.children
        footer.props.onShow(SHOW_COMPLETED)
        const updated = renderer.getRenderOutput()
        const [ , , updatedFooter ] = updated.props.children
        expect(updatedFooter).toMatchSnapshot()
      })

      it('onClearCompleted should call clearCompleted', () => {
        const { output, props } = setup()
        const [ , , footer ] = output.props.children
        footer.props.onClearCompleted()
        expect(props.actions.clearCompleted).toBeCalled()
      })
    })

    describe('todo list', () => {
      it('should filter items', () => {
        const { output, renderer } = setup()
        const [ , , footer ] = output.props.children
        footer.props.onShow(SHOW_COMPLETED)
        const updated = renderer.getRenderOutput()
        const [ , updatedList ] = updated.props.children
        expect(updatedList).toMatchSnapshot()
      })
    })
  })
})
