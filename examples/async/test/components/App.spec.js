import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import { App } from '../../containers/App'
import Picker from '../../components/Picker'
import Posts from '../../components/Posts'

function setup(selectedReddit, isFetching = false, posts = []) {
  const actions = {
    fetchPostsIfNeeded: expect.createSpy(),
    selectReddit: expect.createSpy(),
    invalidateReddit: expect.createSpy()
  }

  const eventArgs = {
    preventDefault: expect.createSpy()
  }

  const component = shallow(
    <App
      selectedReddit={selectedReddit}
      posts={posts}
      isFetching={isFetching}
      lastUpdated={ new Date().getTime() }
      {...actions} />
  )

  return {
    component: component,
    actions: actions,
    picker: component.find(Picker),
    p: component.find('p'),
    refreshLink: component.findWhere(n => n.type() === 'a' && n.contains('Refresh')),
    status: component.find('h2'),
    postList: component.find(Posts),
    postListWrap: component.find('div').last(),
    eventArgs: eventArgs
  }
}

describe('App component', () => {
  it('should render Picker component', () => {
    const { picker } = setup('reactjs')
    expect(picker.length).toEqual(1)
  })

  it('should render last updated', () => {
    const { p } = setup('reactjs')
    expect(p.text()).toMatch(/Last updated at /)
  })

  it('should render refresh link', () => {
    const { refreshLink } = setup('reactjs')
    expect(refreshLink.length).toEqual(1)
  })

  it('should render empty status', () => {
    const { status } = setup('reactjs')
    expect(status.text()).toEqual('Empty.')
  })

  describe('when fetching', () => {
    it('should not render refresh link', () => {
      const { refreshLink } = setup('reactjs', true)
      expect(refreshLink.length).toEqual(0)
    })

    it('should render loading status', () => {
      const { status } = setup('reactjs', true)
      expect(status.text()).toEqual('Loading...')
    })
  })

  describe('when given posts', () => {
    const posts = [
      { title: 'Post 1' },
      { title: 'Post 2' }
    ]

    it('should render Posts component', () => {
      const { postList } = setup('reactjs', false, posts)
      expect(postList.prop('posts')).toEqual(posts)
    })

    describe('when fetching', () => {
      it('should render Posts at half opacity', () => {
        const { postListWrap } = setup('reactjs', true, posts)
        expect(postListWrap.prop('style')).toEqual({ opacity: '0.50' })
      })
    })
  })

  it('should call selectReddit action on Picker change', () => {
    const { picker, actions } = setup('reactjs')
    picker.simulate('change')
    expect(actions.selectReddit).toHaveBeenCalled()
  })

  it('should call invalidateReddit action on refresh click', () => {
    const { refreshLink, actions, eventArgs } = setup('reactjs')
    refreshLink.simulate('click', eventArgs)
    expect(actions.invalidateReddit).toHaveBeenCalled()
  })

  it('should call fetchPostsIfNeeded action on mount', () => {
    const { actions } = setup('reactjs')
    expect(actions.fetchPostsIfNeeded).toHaveBeenCalled()
  })

  it('should call fetchPostsIfNeeded action on refresh click', () => {
    const { refreshLink, actions, eventArgs } = setup('reactjs')
    refreshLink.simulate('click', eventArgs)

    expect(actions.fetchPostsIfNeeded.calls.length).toEqual(2)
  })

  it('should call fetchPostsIfNeeded action when given new selectedReddit', () => {
    const { component, actions } = setup('reactjs')
    component.setProps(Object.assign({}, actions, { selectedReddit: 'frontend', posts: [], isFetching: false, lastUpdated: new Date().getTime() }))

    expect(actions.fetchPostsIfNeeded.calls.length).toEqual(2)
  })
})
