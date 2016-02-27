import React from 'react'
import { render } from 'react-dom'
import { Simulate, createRenderer, findRenderedDOMComponentWithTag } from 'react-addons-test-utils'
import Link from  '../../src/components/Link'
import { expect } from 'chai'

describe('Link', () => {
  let renderer
  const anyText = "text"
  let node

  beforeEach(() => {
    renderer = createRenderer()
    node = document.createElement('div')
  })

  it('should not be clickable when it is active', () => {
    renderer.render(
      <Link
        active = {true}>
        {anyText}
      </Link>
    )

    const result = renderer.getRenderOutput()
    expect(result.type).to.equal('span')
  })

  it('should be clickable when it is not active', () => {
    renderer.render(
      <Link
        active = {false}>
        {anyText}
      </Link>
    )

    const result = renderer.getRenderOutput()
    expect(result.type).to.equal('a')
  })

  it('onLinkClick is triggered when click on the link', (done) => {
    const component = render((
      <Link
        active = {false}
        onLinkClick = {() =>
          done()
        }>
        {anyText}
      </Link>
    ), node)

    const a = findRenderedDOMComponentWithTag(component, 'a')
    Simulate.click(a)
  })
})