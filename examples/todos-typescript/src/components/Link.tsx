import * as React from 'react';

export type Props = {
  active: boolean,
  onClick: () => void
};

const Link: React.SFC<Props> = ({ active, children, onClick }) => {
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
