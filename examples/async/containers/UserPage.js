import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchUser } from '../actions';

class UserPage extends Component {
  render() {
    return (
      <h1 onClick={() => this.props.fetchUser('acdlite')}>
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
    fetchUser: (login) => dispatch(fetchUser(login))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserPage);
