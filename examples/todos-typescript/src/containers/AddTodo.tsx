import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { addTodo } from "../actions";

interface Props {
  dispatch: Dispatch;
}

const AddTodo = ({ dispatch }: Props) => {
  let input: HTMLInputElement;

  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          if (!input.value.trim()) {
            return;
          }
          dispatch(addTodo(input.value));
          input.value = "";
        }}
      >
        <input ref={node => node && (input = node)} />
        <button type="submit">Add Todo</button>
      </form>
    </div>
  );
};

export default connect()(AddTodo);
