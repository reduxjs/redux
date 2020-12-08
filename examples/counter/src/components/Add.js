import React from "react";
import Child from "./Child";
export default class Add extends React.PureComponent {
  render() {
    return (
      <div>
        <div onClick={this.props.onClick}>Button</div>
        Add{this.props.children}
        <Child></Child>
      </div>
    );
  }
}
