import * as React from "react";

interface Props {
  active: boolean;
  onClick: () => void;
  children: React.ReactChild;
}

const Link = ({ active, children, onClick }: Props) => (
  <button
    onClick={onClick}
    disabled={active}
    style={{
      marginLeft: "4px"
    }}
  >
    {children}
  </button>
);

export default Link;
