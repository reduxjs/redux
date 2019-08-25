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

// test strict typing of action creators
// no arguments
const addTodoNoArgs: ActionCreator<AddTodoAction, []> = () => ({
  type: 'ADD_TODO',
  text: 'something'
})

const AddTodoNoneArgs: AddTodoAction = addTodoNoArgs()
// typings:expect-error
addTodoNoArgs('test')

// 1 argument
const addTodo: ActionCreator<AddTodoAction, [string]> = (text: string) => ({
  type: 'ADD_TODO',
  text
})

const addTodoAction: AddTodoAction = addTodo('test')
// typings:expect-error
addTodo(false)
// typings:expect-error
addTodo('hi', 'too many arguments')

// many arguments
const addTodoManyArgs: ActionCreator<
  AddTodoAction,
  [string, 'hi', 5, boolean, number, 6, 7, 8]
> = (
  text: string,
  other: 'hi',
  third: 5,
  fourth: boolean,
  fifth: number,
  sixth: 6
) => ({
  type: 'ADD_TODO',
  text: text + other + third + fourth
})

const addTodoActionMany: AddTodoAction = addTodoManyArgs(
  'hello',
  'hi',
  5,
  false,
  234,
  6,
  7,
  8
)
// typings:expect-error
addTodoManyArgs('hello')
// typings:expect-error
addTodoManyArgs('hi', 'hi', 5, true, 234, 6, 7, 8, 'too many')
// typings:expect-error
addTodoManyArgs('string', 'hi', 5, false, 234, 6, 7, 'oops')

// non-strictly typed action creator
const looseAddTodo: ActionCreator<AddTodoAction> = (text: string) => ({
  type: 'ADD_TODO',
  text
})

const noOops: AddTodoAction = looseAddTodo(false)
const noOops2: AddTodoAction = looseAddTodo(
  'hi',
  'too many arguments, but not strictly typed'
)

type AddTodoThunk = (dispatch: Dispatch) => AddTodoAction

const addTodoViaThunk: ActionCreator<AddTodoThunk> = (text: string) => (
  dispatch: Dispatch
) => ({
  type: 'ADD_TODO',
  text
})

declare const dispatch: Dispatch

const boundAddTodo = bindActionCreators(addTodo, dispatch)

const dispatchedAddTodoAction: AddTodoAction = boundAddTodo('test')

const boundAddTodoViaThunk = bindActionCreators<
  ActionCreator<AddTodoThunk>,
  ActionCreator<AddTodoAction>
>(addTodoViaThunk, dispatch)

const dispatchedAddTodoViaThunkAction: AddTodoAction = boundAddTodoViaThunk(
  'test'
)

const boundActionCreators = bindActionCreators({ addTodo }, dispatch)

const otherDispatchedAddTodoAction: AddTodoAction = boundActionCreators.addTodo(
  'test'
)

interface M extends ActionCreatorsMapObject {
  addTodoViaThunk: ActionCreator<AddTodoThunk>
}

interface N extends ActionCreatorsMapObject {
  addTodoViaThunk: ActionCreator<AddTodoAction>
}

const boundActionCreators2 = bindActionCreators<M, N>(
  {
    addTodoViaThunk
  },
  dispatch
)

const otherDispatchedAddTodoAction2: AddTodoAction = boundActionCreators2.addTodoViaThunk(
  'test'
)
