import expect from 'expect'
import React from 'react'
import { mount } from 'enzyme'
import TodoTextInput from '../../components/TodoTextInput'

function setup(editing, newTodo) {
  const actions = {
    onSave: expect.createSpy()
  }

  const placeholder = 'What needs to be done?'
  const text = 'Use Redux'

  const component = mount(
    <TodoTextInput editing={editing} 
                   newTodo={newTodo}
                   placeholder={placeholder}
                   text={text}
                   {...actions} />
  )

  return {
    component: component,
    actions: actions,
    input: component.find('input')
  }
}

describe('<TodoTextInput />', () => {
  it('should render an input', () => {
    const { input } = setup(false, true)
    expect(input.length).toEqual(1)
  })

  it('should have an edit class on input if editing', () => {
    const { component } = setup(true, false)
    expect(component.find('.edit').length).toEqual(1)
  })

  it('should have a new todo class on input if it is new', () => {
    const { component } = setup(false, true)
    expect(component.find('.new-todo').length).toEqual(1)
  })

  it('should render the text passed in to it', () => {
    const { component } = setup(false, true)
    component.setState({ text: 'Use Redux' })
    const input = component.find('input')
    expect(input.props().value).toEqual('Use Redux')
  })

  it('should call onSave on blur', () => {
    const { actions, input } = setup(false, false)
    input.props().onBlur({ target: { value: 'Use Redux' } })
    expect(actions.onSave).toHaveBeenCalled()
  })

  it('should update the text input value on change', () => {
    const { input } = setup(false, false)
    input.props().onChange({ target: { value: 'Use Redux!' } })
    expect(input.props().value).toEqual('Use Redux!')
  })

  it('should call onSave when return key is pressed if is newTodo', () => {
    const { actions, input } = setup()
    input.props().onKeyDown({ which: 13, target: { value: 'Use Redux!' } })
    expect(actions.onSave).toHaveBeenCalled()
  })

  it('should clear value when return key is pressed if is newTodo', () => {
    const { input } = setup(false, true)
    input.props().onKeyDown({ which: 13, target: { value: 'Use Redux!' } })
    expect(input.props().value).toEqual('')
  })
})
