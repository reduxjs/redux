import * as React from 'react';

import { Text } from '../types/todos';

export interface IProps {
  onClick: () => void;
  completed: boolean;
  text: Text;
}

const Todo: React.SFC<IProps> = ({ onClick, completed, text }) => (
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
