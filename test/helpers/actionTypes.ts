import { Action } from '../..'

export const ADD_TODO = 'ADD_TODO'
export interface AddTodo extends Action<typeof ADD_TODO> {
  text: string
}

export const DISPATCH_IN_MIDDLE = 'DISPATCH_IN_MIDDLE'
export interface DispatchInMiddle extends Action<typeof DISPATCH_IN_MIDDLE> {
  boundDispatchFn: () => void
}

export const GET_STATE_IN_MIDDLE = 'GET_STATE_IN_MIDDLE'
export interface GetStateInMiddle extends Action<typeof GET_STATE_IN_MIDDLE> {
  boundGetStateFn: () => void
}

export const SUBSCRIBE_IN_MIDDLE = 'SUBSCRIBE_IN_MIDDLE'
export interface SubscribeInMiddle extends Action<typeof SUBSCRIBE_IN_MIDDLE> {
  boundSubscribeFn: () => void
}

export const UNSUBSCRIBE_IN_MIDDLE = 'UNSUBSCRIBE_IN_MIDDLE'
export interface UnsubscribeInMiddle
  extends Action<typeof UNSUBSCRIBE_IN_MIDDLE> {
  boundUnsubscribeFn: () => void
}

export const THROW_ERROR = 'THROW_ERROR'
export type ThrowError = Action<typeof THROW_ERROR>

export const UNKNOWN_ACTION = 'UNKNOWN_ACTION'
export type UnknownAction = Action<typeof UNKNOWN_ACTION>

export type rootActions =
  | AddTodo
  | DispatchInMiddle
  | GetStateInMiddle
  | SubscribeInMiddle
  | UnsubscribeInMiddle
  | ThrowError
  | UnknownAction
