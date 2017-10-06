import * as React from 'react';

export interface IProps {
  active: boolean;
  onClick: () => void;
}

const Link: React.SFC<IProps> = ({ active, children, onClick }) => {
  if (active) {
    return <span>{children}</span>;
  }

  return (
    <a
      href="#"
      onClick={(event: any) => {
        event.preventDefault();
        onClick();
      }}
    >
      {children}
    </a>
  );
};

export default Link;
