import React from "react";

export default class Input extends React.Component {
  invoke() {
    // console.log("add33");
  }
  componentDidUpdate() {}
  render() {
    return (
      <div>
        <input readOnly name="count" value={this.props.value} />
        {this.invoke()}
      </div>
    );
  }
}
