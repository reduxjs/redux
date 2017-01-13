import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Footer from './Footer'
import { SHOW_ALL, SHOW_ACTIVE } from '../constants/TodoFilters'

const setup = propOverrides => {
  const props = Object.assign({
    completedCount: 0,
    activeCount: 0,
    filter: SHOW_ALL,
    onClearCompleted: jest.fn(),
    onShow: jest.fn()
  }, propOverrides)

  const renderer = TestUtils.createRenderer()
  renderer.render(<Footer {...props} />)
  const output = renderer.getRenderOutput()

  return {
    props: props,
    output: output
  }
}

const getTextContent = elem => {
  const children = Array.isArray(elem.props.children) ?
    elem.props.children : [ elem.props.children ]

  return children.reduce((out, child) =>
    // Concatenate the text
    // Children are either elements or text strings
    out + (child.props ? getTextContent(child) : child)
  , '')
}

describe('components', () => {
  describe('Footer', () => {
    it('should render container and filters', () => {
      const { output } = setup()
      expect(output).toMatchSnapshot()
    })

    it('should display active count when 0', () => {
      const { output } = setup({ activeCount: 0 })
      const [ count ] = output.props.children
      expect(getTextContent(count)).toBe('No items left')
    })

    it('should display active count when above 0', () => {
      const { output } = setup({ activeCount: 1 })
      const [ count ] = output.props.children
      expect(getTextContent(count)).toBe('1 item left')
    })

    it('should call onShow when a filter is clicked', () => {
      const { output, props } = setup()
      const [ , filters ] = output.props.children
      const filterLink = filters.props.children[1].props.children
      filterLink.props.onClick({})
      expect(props.onShow).toBeCalledWith(SHOW_ACTIVE)
    })

    it('shouldnt show clear button when no completed todos', () => {
      const { output } = setup({ completedCount: 0 })
      const [ , , clear ] = output.props.children
      expect(clear).toBe(undefined)
    })

    it('should render clear button when completed todos', () => {
      const { output } = setup({ completedCount: 1 })
      const [ , , clear ] = output.props.children
      expect(clear).toMatchSnapshot()
    })

    it('should call onClearCompleted on clear button click', () => {
      const { output, props } = setup({ completedCount: 1 })
      const [ , , clear ] = output.props.children
      clear.props.onClick({})
      expect(props.onClearCompleted).toBeCalled()
    })
  })
})
