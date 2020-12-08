import React from "react";
export default class Child extends React.PureComponent {
  render() {
    console.log("child");
    return <div>Child</div>;
  }
}
