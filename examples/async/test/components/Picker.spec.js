import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import Picker from '../../components/Picker'

function setup(value, options = []) {
  const actions = {
    onChange: expect.createSpy()
  }

  const eventArgs = {
    target: {
      value: expect.createSpy()
    }
  }

  const component = shallow(
    <Picker value={value} options={options} {...actions} />
  )

  return {
    component: component,
    actions: actions,
    header: component.find('h1'),
    select: component.find('select'),
    options: component.find('option'),
    eventArgs: eventArgs
  }
}

describe('Picker component', () => {
  it('should display value as header', () => {
    const { header } = setup('Test Value')
    expect(header.text()).toEqual('Test Value')
  })

  it('should select value', () => {
    const { select } = setup('Test Value', [ 'Test Value' ])
    expect(select.prop('value')).toEqual('Test Value')
  })

  it('should render option node for each option', () => {
    const { options } = setup('Test Value', [ 'Test Value', 'Other Value' ])
    expect(options.length).toEqual(2)
  })

  it('should call action on select change', () => {
    const { select, actions, eventArgs } = setup('Test Value', [ 'Test Value', 'Other Value' ])
    select.simulate('change', eventArgs)
    expect(actions.onChange).toHaveBeenCalled()
  })
})
