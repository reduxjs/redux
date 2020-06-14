import React from 'react'
import { mount, shallow } from 'enzyme'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import rootReducer from '../reducers'
import VisibleTodoList, { mapStateToProps } from './VisibleTodoList';
import TodoList from '../Components/TodoList';
import { VisibilityFilters } from '../actions'


const store = createStore(rootReducer)

describe("integration test with mount", () => {
    it('renders an empty list', () => {
        const wrapper = mount(
            <Provider store={store}>
                <VisibleTodoList />
            </Provider>
        )
        expect(wrapper.html()).toBe('<ul></ul>')
    })
})

describe("unit tests", () => {
    describe("mapStateToProps", () => {
        it('maps an empty list to empty list', () => {
            expect(mapStateToProps({ todos: [], visibilityFilter: VisibilityFilters.SHOW_ALL })).toEqual({ todos: [] })
        });
    })

    describe("<TodoList />", () => {
        it('renders an empty list', () => {
            const wrapper = shallow(
                <TodoList todos={[]} toggleTodo={jest.fn()} />
            )
            expect(wrapper.html()).toBe('<ul></ul>')
        })
    })
})

describe("unit tests w/ mount", () => {
})