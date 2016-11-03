import {
  Seducer, Action, combineSeducers,
  SeducersMapObject
} from "../../index.d.ts";


type TodosState = string[];

interface AddTodoAction extends Action {
  text: string;
}


const todosSeducer: Seducer<TodosState> = (state: TodosState,
                                           action: Action): TodosState => {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, (<AddTodoAction>action).text]
    default:
      return state
  }
}

const todosState: TodosState = todosSeducer([], {
  type: 'ADD_TODO',
  text: 'test',
});


type CounterState = number;


const counterSeducer: Seducer<CounterState> = (
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


const rootSeducer: Seducer<RootState> = combineSeducers<RootState>({
  todos: todosSeducer,
  counter: counterSeducer,
})

const rootState: RootState = rootSeducer(undefined, {
  type: 'ADD_TODO',
  text: 'test',
})
