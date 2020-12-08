import React from "react";
import Input from "./components/Input";
import Add from "./components/Add";
import Sub from "./components/Sub";
import { connect } from "react-redux";
import { add, sub } from "./actions";
// import api from "./api";
const Home = function (props) {
  console.log("Home");
  return <div></div>;
};
function Icon() {
  return <div>ICON</div>;
}
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  }
  add() {
    this.setState((state) => {
      return { count: state.count + 1 };
    });
    console.log(this.state.count);
  }
  render() {
    return (
      <React.Fragment>
        <Home></Home>
        <Input value={this.state.count} />
        <Add onClick={() => this.add(1)}>
          <Icon></Icon>
        </Add>
        <Sub />
      </React.Fragment>
    );
  }
}
export default App;
