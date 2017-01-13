import React from 'react'
import TestUtils from 'react-addons-test-utils'
import TodoItem from './TodoItem'

const setup = ( editing = false ) => {
  const props = {
    todo: {
      id: 0,
      text: 'Use Redux',
      completed: false
    },
    editTodo: jest.fn(),
    deleteTodo: jest.fn(),
    completeTodo: jest.fn()
  }

  const renderer = TestUtils.createRenderer()

  renderer.render(
    <TodoItem {...props} />
  )

  let output = renderer.getRenderOutput()

  if (editing) {
    const label = output.props.children.props.children[1]
    label.props.onDoubleClick({})
    output = renderer.getRenderOutput()
  }

  return {
    props: props,
    output: output,
    renderer: renderer
  }
}

describe('components', () => {
  describe('TodoItem', () => {
    it('initial render', () => {
      const { output } = setup()
      expect(output).toMatchSnapshot()
    })

    it('input onChange should call completeTodo', () => {
      const { output, props } = setup()
      const input = output.props.children.props.children[0]
      input.props.onChange({})
      expect(props.completeTodo).toBeCalledWith(0)
    })

    it('button onClick should call deleteTodo', () => {
      const { output, props } = setup()
      const button = output.props.children.props.children[2]
      button.props.onClick({})
      expect(props.deleteTodo).toBeCalledWith(0)
    })

    it('label onDoubleClick should put component in edit state', () => {
      const { output, renderer } = setup()
      const label = output.props.children.props.children[1]
      label.props.onDoubleClick({})
      const updated = renderer.getRenderOutput()
      expect(updated).toMatchSnapshot()
    })

    it('edit state render', () => {
      const { output } = setup(true)
      expect(output).toMatchSnapshot()
    })

    it('TodoTextInput onSave should call editTodo', () => {
      const { output, props } = setup(true)
      output.props.children.props.onSave('Use Redux')
      expect(props.editTodo).toBeCalledWith(0, 'Use Redux')
    })

    it('TodoTextInput onSave should call deleteTodo if text is empty', () => {
      const { output, props } = setup(true)
      output.props.children.props.onSave('')
      expect(props.deleteTodo).toBeCalledWith(0)
    })

    it('TodoTextInput onSave should exit component from edit state', () => {
      const { output, renderer } = setup(true)
      output.props.children.props.onSave('Use Redux')
      const updated = renderer.getRenderOutput()
      expect(updated).toMatchSnapshot()
    })
  })
})
