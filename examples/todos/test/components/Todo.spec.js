import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Todo from '../../components/Todo'

function setup() {
  const props = {
    onClick: expect.createSpy(),
    completed: false,
    text: 'Run the tests'
  }

  const renderer = TestUtils.createRenderer()

  renderer.render(
    <Todo {...props} />
  )

  let output = renderer.getRenderOutput()

  return {
    props: props,
    output: output,
    renderer: renderer
  }
}

describe('components', () => {
  describe('Todo', () => {
    it('initial render', () => {
      const { output } = setup()

      expect(output.type).toBe('li')

      const label = output.props.children

      expect(label).toBe('Run the tests')
    })

    // it('should toggle todo onClick', () => {
    //   const { output, props } = setup()
    //   expect(props.onClick).toHaveBeenCalledWith(0)
    // })
  })
})
