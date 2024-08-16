import type {
  Action,
  ActionCreator,
  ActionCreatorsMapObject,
  Dispatch
} from 'redux'
import { bindActionCreators } from 'redux'
import { addTodo } from '../helpers/actionCreators'

interface AddTodoAction extends Action {
  text: string
}

declare const dispatch: Dispatch

describe('type tests', () => {
  test('ActionCreator', () => {
    const addTodo: ActionCreator<AddTodoAction, [string]> = text => ({
      type: 'ADD_TODO',
      text
    })

    expectTypeOf(addTodo('test')).toEqualTypeOf<AddTodoAction>()
  })

  test('bound', () => {
    type AddTodoThunk = (dispatch: Dispatch) => AddTodoAction
    const addTodoViaThunk: ActionCreator<AddTodoThunk> =
      text => (_: Dispatch) => ({
        type: 'ADD_TODO',
        text
      })

    const boundAddTodo = bindActionCreators(addTodo, dispatch)

    expectTypeOf(boundAddTodo('test')).toMatchTypeOf<AddTodoAction>()

    const boundAddTodoViaThunk = bindActionCreators<
      ActionCreator<AddTodoThunk, [string]>,
      ActionCreator<AddTodoAction, [string]>
    >(addTodoViaThunk, dispatch)

    expectTypeOf(boundAddTodoViaThunk('test')).toEqualTypeOf<AddTodoAction>()

    const boundActionCreators = bindActionCreators({ addTodo }, dispatch)

    expectTypeOf(
      boundActionCreators.addTodo('test')
    ).toMatchTypeOf<AddTodoAction>()

    interface M extends ActionCreatorsMapObject {
      addTodoViaThunk: ActionCreator<AddTodoThunk, [string]>
    }

    interface N extends ActionCreatorsMapObject {
      addTodoViaThunk: ActionCreator<AddTodoAction, [string]>
    }

    const boundActionCreators2 = bindActionCreators<M, N>(
      { addTodoViaThunk },
      dispatch
    )

    expectTypeOf(
      boundActionCreators2.addTodoViaThunk('test')
    ).toEqualTypeOf<AddTodoAction>()
  })
})
