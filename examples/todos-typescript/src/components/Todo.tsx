import * as React from "react";

interface Props {
  completed: boolean;
  onClick: () => void;
  text: string;
}

const Todo = ({ onClick, completed, text }: Props) => (
  <li
    onClick={onClick}
    style={{
      textDecoration: completed ? "line-through" : "none"
    }}
  >
    {text}
  </li>
);

export default Todo;
