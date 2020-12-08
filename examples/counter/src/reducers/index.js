import { combineReducers } from "redux";
import count from "./count";

export default combineReducers({
  input: count
});
