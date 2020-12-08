export default function count(state = { count: 0 }, action) {
  switch (action.type) {
    case "ADD":
      return {
        count: state.count + +action.value
      };
    case "ADDTASKSFAILED":
      return {
        count: 10000
      };
    case "SUB":
      return {
        count: state.count - action.value
      };
    default:
      return state;
  }
}
