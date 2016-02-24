import {
  Reducer, Action, combineReducers,
  ReducersMapObject
} from "../../index.d.ts";


type TodosState = string[];

interface AddTodoAction extends Action {
  text: string;
}


const todosReducer: Reducer<TodosState> = (state: TodosState,
                                           action: Action): TodosState => {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, (<AddTodoAction>action).text]
    default:
      return state
  }
}

const todosState: TodosState = todosReducer([], {
  type: 'ADD_TODO',
  text: 'test',
});


type CounterState = number;


const counterReducer: Reducer<CounterState> = (
  state: CounterState, action: Action
): CounterState => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    default:
      return state
  }
}


type RootState = {
  todos: TodosState;
  counter: CounterState;
}


const rootReducer: Reducer<RootState> = combineReducers<RootState>({
  todos: todosReducer,
  counter: counterReducer,
})

const rootState: RootState = rootReducer(undefined, {
  type: 'ADD_TODO',
  text: 'test',
})
