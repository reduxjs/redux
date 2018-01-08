/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
import { generateActionType } from "./generateActionType";

const ActionTypes = {
  INIT: generateActionType('@@redux/INIT'),
  REPLACE: generateActionType('@@redux/REPLACE')
}

export default ActionTypes
