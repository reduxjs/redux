import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import Footer from '../../components/Footer'
import FilterLink from '../../containers/FilterLink'

function setup() {
  const component = shallow(
    <Footer />
  )

  return {
    component: component,
    filterLink: component.find(FilterLink)
  }
}

describe('<FilterLink />', () => {
  it('should render three <FilterLink /> components', () => {
    const { filterLink } = setup()
    expect(filterLink.length).toEqual(3)
  })

  it('should pass right props to first FilterLink', () => {
    const { filterLink } = setup()
    const props = {
      children: 'All',
      filter: 'SHOW_ALL'
    }
    expect(filterLink.at(0).props()).toEqual(props)
  })

  it('should pass right props to second FilterLink', () => {
    const { filterLink } = setup()
    const props = {
      children: 'Active',
      filter: 'SHOW_ACTIVE'
    }
    expect(filterLink.at(1).props()).toEqual(props)
  })

  it('should pass right props to third FilterLink', () => {
    const { filterLink } = setup()
    const props = {
      children: 'Completed',
      filter: 'SHOW_COMPLETED'
    }
    expect(filterLink.at(2).props()).toEqual(props)
  })
})
