import React from 'react'
import { mount, shallow } from 'enzyme'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import rootReducer from '../reducers'
import VisibleTodoList, { mapStateToProps } from './VisibleTodoList';
import TodoList from '../Components/TodoList';
import { VisibilityFilters } from '../actions'



describe("integration test, high verification", () => {
    it('renders an empty list', () => {
        const store = createStore(rootReducer)
        const wrapper = mount(
            <Provider store={store}>
                <VisibleTodoList />
            </Provider>
        )
        expect(wrapper.html()).toBe('<ul></ul>')
    })

    it('renders a single todo', () => {
        const store = createStore(rootReducer, {
            todos: [
                { id: 1, completed: false, text: 'hello world' }
            ],
            visibilityFilter: VisibilityFilters.SHOW_ACTIVE
        })
        const wrapper = mount(
            <Provider store={store}>
                <VisibleTodoList />
            </Provider>
        )
        expect(wrapper.html()).toBe('<ul><li style=\"text-decoration: none;\">hello world</li></ul>')
    })

    it('toggles todo', () => {
        const store = createStore(rootReducer, {
            todos: [
                { id: 1, completed: true, text: 'hello world' }
            ],
            visibilityFilter: VisibilityFilters.SHOW_ACTIVE
        })
        const wrapper = mount(
            <Provider store={store}>
                <VisibleTodoList />
            </Provider>
        )
        expect(wrapper.html()).toBe('<ul></ul>')
    })
})

describe("unit tests, high isolation", () => {
    describe("mapStateToProps", () => {
        it('maps an empty list to empty list', () => {
            const props = mapStateToProps({
                todos: [],
                visibilityFilter: VisibilityFilters.SHOW_ALL
            })
            expect(props).toEqual({ todos: [] })
        });
    })

    describe("<VisibleTodoList /> container", () => {
        it('supplies an empty list', () => {
            const store = createStore(rootReducer)
            const wrapper = mount(
                <Provider store={store}>
                    <VisibleTodoList />
                </Provider>
            )
            expect(wrapper.find('TodoList').prop('todos')).toEqual([])
        })

        it('supplies an onClick prop that toggles a todo', () => {
            const store = createStore(rootReducer, {
                todos: [
                    { id: 1, completed: false, text: 'hello world' }
                ],
                visibilityFilter: VisibilityFilters.SHOW_ACTIVE
            })
            const wrapper = mount(
                <Provider store={store}>
                    <VisibleTodoList />
                </Provider>
            )
            wrapper.find('Todo').prop('onClick')()
            wrapper.update()
            expect(wrapper.find('TodoList').prop('todos')).toEqual([])
        })
    });

    describe("<TodoList /> presentation component", () => {
        it('renders an empty list', () => {
            const wrapper = shallow(
                <TodoList todos={[]} toggleTodo={jest.fn()} />
            )
            expect(wrapper.html()).toBe('<ul></ul>')
        })
    })
})
