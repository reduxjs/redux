import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import Footer from '../../components/Footer'
import { SHOW_ALL, SHOW_ACTIVE } from '../../constants/TodoFilters'

function setup(propOverrides) {
  const props = Object.assign({
    completedCount: 0,
    activeCount: 0,
    filter: SHOW_ALL,
    onClearCompleted: expect.createSpy(),
    onShow: expect.createSpy()
  }, propOverrides)
  
  const titles = [
    'All',
    'Active',
    'Completed'
  ]

  const component = shallow(
    <Footer {...props} />
  )

  return {
    component: component,
    props: props,
    titles: titles,
    footer: component.find('footer')
  }
}

describe('<Footer />', () => {
  it('should render a component', () => {
    const { footer } = setup()
    expect(footer.length).toEqual(1)
    expect(footer.find('.footer').length).toEqual(1)
  })

  it('should display active count when 0', () => {
    const { footer } = setup({ activeCount: 0 })
    expect(footer.find('.todo-count').text()).toEqual('No items left')
  })

  it('should display active count when above 0', () => {
    const { footer } = setup({ activeCount: 1 })
    expect(footer.find('.todo-count').text()).toEqual('1 item left')
  })

  it('should render filters', () => {
    const { footer, titles } = setup()
    expect(footer.find('ul').length).toEqual(1)
    expect(footer.find('.filters').length).toEqual(1)
    expect(footer.find('li').length).toBe(3)
    
    footer.find('li').forEach((elem, i) => {
      expect(elem.find('a').hasClass('selected'))
        .toEqual(i === 0 ? true : false)
      expect(elem.find('a').text()).toEqual(titles[i])
    })
  })

  it('should call onShow when a filter is clicked', () => {
    const { component, props } = setup()
    component.find('a').at(1).simulate('click')
    expect(props.onShow).toHaveBeenCalledWith(SHOW_ACTIVE)
  })

  it('shouldnt show clear button when no completed todos', () => {
    const { component } = setup({ completedCount: 0 })
    expect(component.find('.clear-completed').length).toEqual(0)
  })

  it('should render clear button when completed todos', () => {
    const { component } = setup({ completedCount: 1 })
    expect(component.find('.clear-completed').length).toEqual(1)
  })

  it('should call onClearCompleted on clear button click', () => {
    const { component, props } = setup({ completedCount: 1 })
    component.find('.clear-completed').at(0).simulate('click')
    expect(props.onClearCompleted).toHaveBeenCalled()
  })
})
