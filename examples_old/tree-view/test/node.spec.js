import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import ConnectedNode, { Node } from '../containers/Node'

function setup(id, counter, childIds, parentId) {
  const actions = {
    increment: expect.createSpy(),
    removeChild: expect.createSpy(),
    deleteNode: expect.createSpy(),
    createNode: expect.createSpy(),
    addChild: expect.createSpy()
  }

  const eventArgs = {
    preventDefault: expect.createSpy()
  }

  const component = shallow(
    <Node id={id} counter={counter} parentId={parentId} childIds={childIds} {...actions} />
  )

  return {
    component: component,
    removeLink: component.findWhere(n => n.type() === 'a' && n.contains('×')),
    addLink: component.findWhere(n => n.type() === 'a' && n.contains('Add child')),
    button: component.find('button'),
    childNodes: component.find(ConnectedNode),
    actions: actions,
    eventArgs: eventArgs
  }
}

describe('Node component', () => {
  it('should display counter', () => {
    const { component } = setup(1, 23, [])
    expect(component.text()).toMatch(/^Counter: 23/)
  })

  it('should call increment on button click', () => {
    const { button, actions } = setup(1, 23, [])
    button.simulate('click')

    expect(actions.increment).toHaveBeenCalledWith(1)
  })

  it('should not render remove link', () => {
    const { removeLink } = setup(1, 23, [])
    expect(removeLink.length).toEqual(0)
  })

  it('should call createNode action on Add child click', () => {
    const { addLink, actions, eventArgs } = setup(2, 1, [])
    actions.createNode.andReturn({ nodeId: 3 })
    addLink.simulate('click', eventArgs)

    expect(actions.createNode).toHaveBeenCalled()
  })

  it('should call addChild action on Add child click', () => {
    const { addLink, actions, eventArgs } = setup(2, 1, [])
    actions.createNode.andReturn({ nodeId: 3 })

    addLink.simulate('click', eventArgs)

    expect(actions.addChild).toHaveBeenCalledWith(2, 3)
  })

  describe('when given childIds', () => {
    it('should render child nodes', () => {
      const { childNodes } = setup(1, 23, [ 2, 3 ])
      expect(childNodes.length).toEqual(2)
    })
  })

  describe('when given parentId', () => {
    it('should call removeChild action on remove link click', () => {
      const { removeLink, actions, eventArgs } = setup(2, 1, [], 1)
      removeLink.simulate('click', eventArgs)

      expect(actions.removeChild).toHaveBeenCalledWith(1, 2)
    })

    it('should call deleteNode action on remove link click', () => {
      const { removeLink, actions, eventArgs } = setup(2, 1, [], 1)
      removeLink.simulate('click', eventArgs)

      expect(actions.deleteNode).toHaveBeenCalledWith(2)
    })
  })
})
