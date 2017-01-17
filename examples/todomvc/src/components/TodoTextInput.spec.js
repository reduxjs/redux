import React from 'react'
import TestUtils from 'react-addons-test-utils'
import TodoTextInput from './TodoTextInput'

const setup = propOverrides => {
  const props = Object.assign({
    onSave: jest.fn(),
    text: 'Use Redux',
    placeholder: 'What needs to be done?',
    editing: false,
    newTodo: false
  }, propOverrides)

  const renderer = TestUtils.createRenderer()

  renderer.render(
    <TodoTextInput {...props} />
  )

  const output = renderer.getRenderOutput()

  return {
    props: props,
    output: output,
    renderer: renderer,
    nodeMajorVersion: Number(process.versions.node.split('.')[0], 10)
  }
}

describe('components', () => {
  describe('TodoTextInput', () => {
    it('should render correctly', () => {
      const { output, nodeMajorVersion } = setup()
      expect(output.props.placeholder).toEqual('What needs to be done?')
      expect(output.props.value).toEqual('Use Redux')
      expect(output.props.className).toEqual('')

      if (nodeMajorVersion > 5) {
        expect(output).toMatchSnapshot()
      }
    })

    it('should render correctly when editing=true', () => {
      const { output, nodeMajorVersion } = setup({ editing: true })
      expect(output.props.className).toEqual('edit')

      if (nodeMajorVersion > 5) {
        expect(output).toMatchSnapshot()
      }
    })

    it('should render correctly when newTodo=true', () => {
      const { output, nodeMajorVersion } = setup({ newTodo: true })
      expect(output.props.className).toEqual('new-todo')

      if (nodeMajorVersion > 5) {
        expect(output).toMatchSnapshot()
      }
    })

    it('should update value on change', () => {
      const { output, renderer, nodeMajorVersion } = setup()
      output.props.onChange({ target: { value: 'Use Radox' } })
      const updated = renderer.getRenderOutput()
      expect(updated.props.value).toEqual('Use Radox')

      if (nodeMajorVersion > 5) {
        expect(updated).toMatchSnapshot()
      }
    })

    it('should call onSave on return key press', () => {
      const { output, props } = setup()
      output.props.onKeyDown({ which: 13, target: { value: 'Use Redux' } })
      expect(props.onSave).toBeCalledWith('Use Redux')
    })

    it('should reset state on return key press if newTodo', () => {
      const { output, renderer, nodeMajorVersion } = setup({ newTodo: true })
      output.props.onKeyDown({ which: 13, target: { value: 'Use Redux' } })
      const updated = renderer.getRenderOutput()
      expect(updated.props.value).toEqual('')

      if (nodeMajorVersion > 5) {
        expect(updated).toMatchSnapshot()
      }
    })

    it('should call onSave on blur', () => {
      const { output, props } = setup()
      output.props.onBlur({ target: { value: 'Use Redux' } })
      expect(props.onSave).toBeCalledWith('Use Redux')
    })

    it('shouldnt call onSave on blur if newTodo', () => {
      const { output, props } = setup({ newTodo: true })
      output.props.onBlur({ target: { value: 'Use Redux' } })
      expect(props.onSave).not.toBeCalled()
    })
  })
})
