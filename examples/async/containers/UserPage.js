import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getUser } from '../actions';

class UserPage extends Component {
  render() {
    return (
      <h1 onClick={() => this.props.getUser('gaearon')}>
        Oh
      </h1>
    );
  }
}

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    getUser: (login) => dispatch(getUser(login))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserPage);
