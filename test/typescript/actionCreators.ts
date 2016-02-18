import {
  ActionCreator, Action, Dispatch,
  bindActionCreators
} from "../../index.d.ts";


interface AddTodoAction extends Action<string> {
  text: string;
}

const addTodo: ActionCreator<AddTodoAction> = (text: string) => ({
  type: 'ADD_TODO',
  text
})

const addTodoAction: AddTodoAction = addTodo('test');


declare const dispatch: Dispatch;

const boundAddTodo = bindActionCreators(addTodo, dispatch);

const dispatchedAddTodoAction: AddTodoAction = boundAddTodo('test');


const boundActionCreators = bindActionCreators({addTodo}, dispatch);

const otherDispatchedAddTodoAction: AddTodoAction =
  boundActionCreators.addTodo('test');
