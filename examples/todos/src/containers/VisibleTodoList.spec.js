import React from 'react'
import { mount } from 'enzyme'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import rootReducer from '../reducers'
import VisibleTodoList from './VisibleTodoList';

const store = createStore(rootReducer)

it('renders an empty list', () => {
    const wrapper = mount(
        <Provider store={store}>
            <VisibleTodoList />
        </Provider>
    )
    expect(wrapper.html()).toBe('<ul></ul>')
})