import React from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'

import Link from '../../components/Link'

function setup(propsOverride) {
  const renderer = TestUtils.createRenderer()
  renderer.render(
    <Link
      active={false}
      onClick={() => {}}
      {...propsOverride}
    >
      Click me!
    </Link>
  )
  return renderer.getRenderOutput()
}

describe('Components', () => {
  describe('Link', () => {
    it('Returns a span with children if active', () => {
      const output = setup({
        active: true
      })
      expect(output.type).toBe('span')
      expect(output.props.children).toBe('Click me!')
    })

    it('Returns a anchor with children if not active', () => {
      const output = setup()
      expect(output.type).toBe('a')
      expect(output.props.children).toBe('Click me!')
    })

    it('Fires the onClick function that is passed in', () => {
      let hasFired = false
      const renderer = TestUtils.createRenderer()
      renderer.render(
        <Link
          active={false}
          onClick={() => {
            hasFired = true
          }}
        >
          Test onClick
        </Link>
      )
      const link = renderer.getRenderOutput()
      // Simulate the onClick event without actually rendering this component into some sort
      // of DOM, and pass a fake preventDefault function so tests don't explode
      link.props.onClick({
        preventDefault() {}
      })

      expect(hasFired).toBe(true)
    })
  })
})
