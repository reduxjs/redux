import {Action as ReduxAction} from "../../index.d.ts";


namespace FSA {
  interface Action<P> extends ReduxAction<string> {
    payload: P;
  }

  const action: Action<string> = {
    type: 'ACTION_TYPE',
    payload: 'test',
  }

  const payload: string = action.payload;
}


namespace FreeShapeAction {
  interface Action extends ReduxAction<string> {
    [key: string]: any;
  }

  const action: Action = {
    type: 'ACTION_TYPE',
    text: 'test',
  }

  const text: string = action['text'];
}


namespace StringLiteralTypeAction {
  type ActionType = 'A' | 'B' | 'C';

  const action: ReduxAction<ActionType> = {
    type: 'A'
  }

  const type: ActionType = action.type;
}


namespace EnumTypeAction {
  enum ActionType {
    A, B, C
  }

  const action: ReduxAction<ActionType> = {
    type: ActionType.A
  }

  const type: ActionType = action.type;
}
