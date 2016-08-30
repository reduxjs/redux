import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import Posts from '../../components/Posts'

function setup(posts = []) {
  const component = shallow(
    <Posts posts={posts} />
  )

  return {
    component: component,
    listItems: component.find('li')
  }
}

describe('Posts component', () => {
  it('should render a list item with post title', () => {
    const posts = [
      { title: 'Post 1' }
    ]

    const { listItems } = setup(posts)
    expect(listItems.first().text()).toEqual('Post 1')
  })

  it('should render a list item for each post', () => {
    const posts = [
      { title: 'Post 1' },
      { title: 'Post 2' }
    ]

    const { listItems } = setup(posts)
    expect(listItems.length).toEqual(2)
  })
})
