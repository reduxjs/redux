import * as React from 'react';

import { Text } from '../types/todos';

export type Props = {
  onClick: () => void,
  completed: boolean,
  text: Text
};

const Todo: React.SFC<Props> = ({ onClick, completed, text }) => (
  <li
    onClick={onClick}
    style={{
      textDecoration: completed ? 'line-through' : 'none'
    }}
  >
    {text}
  </li>
);

export default Todo;
