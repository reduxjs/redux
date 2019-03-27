import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { openEditForm, editTodo, deleteTodo, duplicateTodo } from "../actions";

const Todo = ({ onClick, completed, text, id, dispatch, progressEdit }) => {
  let input;
  return (
    <div>
      <span
        onClick={onClick}
        style={{
          textDecoration: completed ? "line-through" : "none"
        }}
      >
        -{text}
      </span>{" "}
      <button
        style={{ marginLeft: "50px" }}
        onClick={() => console.log(dispatch(openEditForm(id)), progressEdit)}
      >
        EDIT
      </button>
      <button
        style={{ marginLeft: "5px" }}
        onClick={() => console.log(dispatch(deleteTodo(id)))}
      >
        DELETE
      </button>
      <button
        style={{ marginLeft: "5px" }}
        onClick={() => console.log(dispatch(duplicateTodo(text)))}
      >
        DUPLICATE
      </button>
      {progressEdit ? (
        <form
          onSubmit={e => {
            e.preventDefault();
            if (!input.value.trim()) {
              return;
            }
            dispatch(editTodo(id, input.value));
            input.value = "";
          }}
        >
          <input type="text" ref={node => (input = node)} />
          <input type="submit" />
        </form>
      ) : null}
    </div>
  );
};

Todo.propTypes = {
  onClick: PropTypes.func.isRequired,
  completed: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired
};

export default connect()(Todo);
