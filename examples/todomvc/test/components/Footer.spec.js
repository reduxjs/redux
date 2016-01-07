import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Footer from '../../components/Footer'
import { SHOW_ALL, SHOW_ACTIVE } from '../../constants/TodoFilters'
import { StateInfoConfig, StateController, StateContext } from 'navigation'

function setup(propOverrides) {
  StateInfoConfig.build([
    { key: 'todomvc', initial: 'app', states: [
      { key: 'app', route: '{filter?}', defaults: { filter: 'all' }, trackCrumbTrail: false }
    ] }   
  ])
  StateController.navigate('todomvc')

  const props = Object.assign({
    completedCount: 0,
    activeCount: 0,
    onClearCompleted: expect.createSpy()
  }, propOverrides)

  const renderer = TestUtils.createRenderer()
  renderer.render(<Footer {...props} />)
  const output = renderer.getRenderOutput()

  return {
    props: props,
    output: output
  }
}

function getTextContent(elem) {
  const children = Array.isArray(elem.props.children) ?
    elem.props.children : [ elem.props.children ]

  return children.reduce(function concatText(out, child) {
    // Children are either elements or text strings
    return out + (child.props ? getTextContent(child) : child)
  }, '')
}

describe('components', () => {
  describe('Footer', () => {
    it('should render container', () => {
      const { output } = setup()
      expect(output.type).toBe('footer')
      expect(output.props.className).toBe('footer')
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

    it('should render filters', () => {
      const { output } = setup()
      const [ , filters ] = output.props.children
      var renderer = TestUtils.createRenderer()
      expect(filters.type).toBe('ul')
      expect(filters.props.className).toBe('filters')
      expect(filters.props.children.length).toBe(3)
      filters.props.children.forEach(function checkFilter(filter, i) {
        expect(filter.type).toBe('li')
        const link = filter.props.children
        renderer.render(link)
        const a = renderer.getRenderOutput()
        expect(a.props.className).toBe(i === 0 ? 'selected' : undefined)
        expect(a.props.children).toBe({
          0: 'All',
          1: 'Active',
          2: 'Completed'
        }[i])
      })
    })

    it('should set filter when a filter is clicked', () => {
      const { output, props } = setup()
      const [ , filters ] = output.props.children
      const filterLink = filters.props.children[1].props.children
      var renderer = TestUtils.createRenderer()
      renderer.render(filterLink)
      const a = renderer.getRenderOutput()
      StateController.navigateLink(a.props.href.substring(1))
      expect(StateContext.data.filter).toBe('active')
    })

    it('shouldnt show clear button when no completed todos', () => {
      const { output } = setup({ completedCount: 0 })
      const [ , , clear ] = output.props.children
      expect(clear).toBe(undefined)
    })

    it('should render clear button when completed todos', () => {
      const { output } = setup({ completedCount: 1 })
      const [ , , clear ] = output.props.children
      expect(clear.type).toBe('button')
      expect(clear.props.children).toBe('Clear completed')
    })

    it('should call onClearCompleted on clear button click', () => {
      const { output, props } = setup({ completedCount: 1 })
      const [ , , clear ] = output.props.children
      clear.props.onClick({})
      expect(props.onClearCompleted).toHaveBeenCalled()
    })
  })
})
