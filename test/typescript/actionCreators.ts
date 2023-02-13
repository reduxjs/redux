import {
  ActionCreator,
  Action,
  Dispatch,
  bindActionCreators,
  ActionCreatorsMapObject
} from 'redux'

interface AddTodoAction extends Action {
  text: string
}

const addTodo: ActionCreator<AddTodoAction, [string]> = text => ({
  type: 'ADD_TODO',
  text
})

const addTodoAction: AddTodoAction = addTodo('test')

type AddTodoThunk = (dispatch: Dispatch) => AddTodoAction

const addTodoViaThunk: ActionCreator<AddTodoThunk> = text => (_: Dispatch) => ({
  type: 'ADD_TODO',
  text
})

declare const dispatch: Dispatch

function bound() {
  const boundAddTodo = bindActionCreators(addTodo, dispatch)

  const dispatchedAddTodoAction: AddTodoAction = boundAddTodo('test')

  const boundAddTodoViaThunk = bindActionCreators<
    ActionCreator<AddTodoThunk, [string]>,
    ActionCreator<AddTodoAction, [string]>
  >(addTodoViaThunk, dispatch)

  const dispatchedAddTodoViaThunkAction: AddTodoAction =
    boundAddTodoViaThunk('test')

  const boundActionCreators = bindActionCreators({ addTodo }, dispatch)

  const otherDispatchedAddTodoAction: AddTodoAction =
    boundActionCreators.addTodo('test')

  interface M extends ActionCreatorsMapObject {
    addTodoViaThunk: ActionCreator<AddTodoThunk, [string]>
  }

  interface N extends ActionCreatorsMapObject {
    addTodoViaThunk: ActionCreator<AddTodoAction, [string]>
  }

  const boundActionCreators2 = bindActionCreators<M, N>(
    {
      addTodoViaThunk
    },
    dispatch
  )

  const otherDispatchedAddTodoAction2: AddTodoAction =
    boundActionCreators2.addTodoViaThunk('test')
}
