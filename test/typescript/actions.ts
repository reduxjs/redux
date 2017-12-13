import {Action as ReduxAction} from "redux"


namespace FSA {
  interface Action<P> extends ReduxAction {
    payload: P;
  }

  const action: Action<string> = {
    type: 'ACTION_TYPE',
    payload: 'test',
  }

  const payload: string = action.payload;
}


namespace FreeShapeAction {
  interface Action extends ReduxAction {
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

  interface Action extends ReduxAction {
    type: ActionType;
  }

  const action: Action = {
    type: 'A'
  }

  const type: ActionType = action.type;
}


namespace EnumTypeAction {
  enum ActionType {
    A, B, C
  }

  interface Action extends ReduxAction {
    type: ActionType;
  }

  const action: Action = {
    type: ActionType.A
  }

  const type: ActionType = action.type;
}
