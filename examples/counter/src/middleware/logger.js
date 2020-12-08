export default function (store) {
  return function (next) {
    console.log("正在发送中");
    return function (action) {
      // console.group(action.type);
      // console.log("dispatch start", action);
      let result = next(action);
      // console.log("next State", store.getState());
      // console.groupEnd(action.type);
      return result;
    };
  };
}
