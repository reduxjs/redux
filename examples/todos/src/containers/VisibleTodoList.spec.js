import React from 'react'
import { mount, shallow } from 'enzyme'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import rootReducer from '../reducers'
import VisibleTodoList, { mapStateToProps } from './VisibleTodoList';
import TodoList from '../Components/TodoList';
import Todo from '../Components/Todo';
import { VisibilityFilters } from '../actions'


/**
 * These integration tests focus on testing user facing behavior. It avoids asserting directly on any reducers,
 * selectors, or isolating any children components, as well as avoids asserting on implementation details like state/props.
 * 
 * Generally, to verify most software, you should be testing in this style.
 */
describe("integration test, high verification, less brittle, less error locatalization", () => {
    it('renders an empty list', () => {
        // Feel free to mock out the <TodoList /> here to make it an integration test of only
        // the Container + Redux sub-components. This could still be considered an "integration test",
        // but it could integration test smaller or larger slices of functionality depending on your needs.
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

/**
 * These types of tests should be used to supplement the above "integration" style tests, for advanced users & complex apps.
 * 
 * They do not provide the same level of verification as the integration style tests, but they allow
 * for testing more edge cases with less mocking, and run faster. It may also provide diminishing returns
 * to write only (or mostly) integration style tests, depending on the type of app you're testing.
 * 
 * For example, an app with a very few, but very complex components may have a lot of "combinatorial"
 * explosions of feature interactions. It may not be possible to test every combination of functionality, so
 * it may make sense to have integration tests for more common combinations, and supplement with unit tests.
 * 
 * For something simpler like this "todo" list app, these unit tests will be more tightly coupled to the
 * code & should be avoided. They'll make it harder to refactor, because the tests are pinning down lots of
 * implementation details. The tradeoff here, which makes this approach worth considering, is that they also
 * document these implementation details (tests as docs), so in larger teams or complex apps, it can be worthwhile
 * to have a varying degree of your tests isolation/unit tests like these.
 * 
 * In more complex apps, an integration test may fail in a generic way, and having unit tests may increase the
 * error localization of the tests, making it more obvious about *why* an integration test may have failed.
 */
describe("unit tests, high isolation, better error localization, brittle/less verification", () => {
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
            // Feel free to mock out <TodoList/> & the redux store here to increase the isolation of the container
            const store = createStore(rootReducer)
            const wrapper = mount(
                <Provider store={store}>
                    <VisibleTodoList />
                </Provider>
            )
            expect(wrapper.find('TodoList').prop('todos')).toEqual([])
        })

        it('supplies a toggleTodo prop that toggles a todo', () => {
            // Feel free to mock out <TodoList/> & the redux store here to increase the isolation of the container
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
            wrapper.find('TodoList').prop('toggleTodo')(1)
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

        it('renders a todo, with correct onClick prop', () => {
            const id = 1
            const toggleTodo = jest.fn()
            const wrapper = shallow(
                <TodoList
                    todos={
                        [
                            {
                                id,
                                completed: false,
                                text: 'hello world'
                            }
                        ]
                    }
                    toggleTodo={toggleTodo}
                />
            )
            expect(wrapper.find('Todo').props()).toMatchObject({
                id: 1,
                completed: false,
                text: 'hello world',
            })
            expect(toggleTodo).toHaveBeenCalledTimes(0)
            wrapper.find('Todo').prop('onClick')()
            expect(toggleTodo).toHaveBeenCalledTimes(1)
            expect(toggleTodo).toHaveBeenCalledWith(id)
        })
    })

    describe("<Todo /> presentation component", () => {
        it('calls toggleTodo callback prop on click', () => {
            const toggleTodo = jest.fn()
            const wrapper = shallow(
                <Todo
                    id={1}
                    completed={false}
                    text={'hello world'}
                    onClick={toggleTodo}
                />
            )
            expect(toggleTodo).toHaveBeenCalledTimes(0)
            wrapper.find('li').prop('onClick')()
            expect(toggleTodo).toHaveBeenCalledTimes(1)
        })
    })
})
