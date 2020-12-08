// Action创建器，这个是一个纯函数，相当于dispatch和action对象的中介者
import api from "../api";
function addTasksSuccessed(value) {
  return {
    type: "ADD",
    value
  };
}
function addTasksFailed(error) {
  return {
    type: "ADDTASKSFAILED",
    payload: {
      error
    }
  };
}
// 返回的并不是一个对象而是一个函数
export const add = () => {
  return (dispatch) => {
    dispatch(addTasksSuccessed(1));
    return;
    return api
      .fetchTasks()
      .then((value) => {
        let result = dispatch(addTasksSuccessed(value));
        return result;
      })
      .catch((data) => {
        return dispatch(addTasksFailed(data));
      });
  };
};
export const sub = function (value) {
  return { type: "SUB", value };
};
