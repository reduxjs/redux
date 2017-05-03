import React from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'
import Footer from '../../components/Footer'

function setup() {
  const renderer = TestUtils.createRenderer()
  renderer.render(<Footer />)
  return renderer.getRenderOutput()
}

function getTextContent(elem) {
  const children = Array.isArray(elem.props.children) ?
    elem.props.children : [ elem.props.children ]

  return children.reduce(function concatText(out, child) {
    // Children are either elements or text strings
    return out + (child.props ? getTextContent(child) : child)
  }, '')
}

describe('Components', () => {
  describe('Footer', () => {
    it('Displays correct content', () => {
      const output = setup()
      expect(getTextContent(output)).toBe('Show: All, Active, Completed')
    })
  })
})
