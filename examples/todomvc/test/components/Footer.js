import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import Footer from '../../components/Footer'
import * as TodoFilters from '../../constants/TodoFilters'

function setup(activeCount, completedCount, visibilityFilter) {
  const actions = {
    onClearCompleted: expect.createSpy(),
    onShow: expect.createSpy()
  }

  const component = shallow(
    <Footer activeCount={activeCount}
            completedCount={completedCount}
            visibilityFilter={visibilityFilter}
            {...actions} />
  )

  return {
    component: component,
    actions: actions,
    todoCount: component.find('.todo-count'),
    filters: component.find('.filters'),
    clearCompleted: component.find('.clear-completed')
  }
}

describe('<Footer />', () => { 
  it('should render a todo count for items not done', () => {
    const { todoCount } = setup(2, 0, TodoFilters.SHOW_ALL)
    expect(todoCount.text()).toMatch(/^2 items left/)
  })

  it('should render a todo count for items done', () => {
    const { todoCount } = setup(0, 2, TodoFilters.SHOW_ALL)
    expect(todoCount.text()).toMatch(/^No items left/)
  })

  it('should render three Link components', () => {
    const { filters } = setup(2, 0, TodoFilters.SHOW_ALL)
    expect(filters.find('Link').length).toEqual(3)
  })

  it('should render an all Link', () => {
    const { filters } = setup(2, 0, TodoFilters.SHOW_ALL)
    const Link = filters.find('Link').at(0).render()
    expect(Link.text()).toMatch(/^All/)
  })

  it('should render an active Link', () => {
    const { filters } = setup(2, 0, TodoFilters.SHOW_ALL)
    const Link = filters.find('Link').at(1).render()
    expect(Link.text()).toMatch(/^Active/)
  })

  it('should render a completed Link', () => {
    const { filters } = setup(2, 0, TodoFilters.SHOW_ALL)
    const Link = filters.find('Link').at(2).render()
    expect(Link.text()).toMatch(/^Completed/)
  })

  it('should call onShow on click of each Link', () => {
    const { filters, actions } = setup(2, 0, TodoFilters.SHOW_ALL)
    filters.find('Link').at(0).simulate('click')
    expect(actions.onShow).toHaveBeenCalled()
  })

  it('should not show a clear completed button if todos are completed', () => {
    const { clearCompleted } = setup(2, 0, TodoFilters.SHOW_ALL)
    expect(clearCompleted.length).toEqual(0)
  })

  it('should show a clear completed button if todos are completed', () => {
    const { clearCompleted } = setup(2, 2, TodoFilters.SHOW_ALL)
    expect(clearCompleted.length).toEqual(1)
  })

  it('should render clear completed button with Clear Completed text', () => {
    const { clearCompleted } = setup(2, 2, TodoFilters.SHOW_ALL)
    expect(clearCompleted.text()).toEqual('Clear completed')
  })

  it('should call onClearCompleted with clear completed button clicked', () => {
    const { clearCompleted, actions } = setup(2, 2, TodoFilters.SHOW_ALL)
    clearCompleted.simulate('click')
    expect(actions.onClearCompleted).toHaveBeenCalled()
  })

})
