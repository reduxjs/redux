import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Explore from '../components/Explore';
import { resetErrorMessage, setInputValue } from '../actions';

class App extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleDismissClick = this.handleDismissClick.bind(this);
    this.nextValue = this.nextValue.bind(this);
  }

  handleDismissClick(e) {
    this.props.resetErrorMessage();
    e.preventDefault();
  }

  nextValue() {
    // Injected by React Router
    const { location } = this.props;
    const { pathname } = location;

    return this.props.inputValue === null ?
      pathname.substring(1) : this.props.inputValue;
  }

  handleChange() {
    // Available thanks to contextTypes below
    const { router } = this.context;

    const nextValue = this.nextValue();
    router.transitionTo(`/${nextValue}`);
  }

  renderErrorMessage() {
    const { errorMessage } = this.props;
    if (!errorMessage) {
      return null;
    }

    return (
      <p style={{ backgroundColor: '#e99', padding: 10 }}>
        <b>{errorMessage}</b>
        {' '}
        (<a href="#"
            onClick={this.handleDismissClick}>
          Dismiss
        </a>)
      </p>
    );
  }

  render() {
    const { children } = this.props;
    const value = this.nextValue();

    return (
      <div>
        <Explore value={value}
                 handleGoClick={this.handleChange}
                 setInputValue={this.props.setInputValue} />
        <hr />
        {this.renderErrorMessage()}
        {children}
      </div>
    );
  }
}

App.propTypes = {
  inputValue: PropTypes.string,
  setInputValue: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  resetErrorMessage: PropTypes.func.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }),
  params: PropTypes.shape({
    userLogin: PropTypes.string,
    repoName: PropTypes.string
  }).isRequired,
  children: PropTypes.node
};

App.contextTypes = {
  router: PropTypes.object.isRequired
};

function mapStateToProps(state) {
  return {
    errorMessage: state.errorMessage,
    inputValue: state.inputValue
  };
}

export default connect(
  mapStateToProps,
  { resetErrorMessage, setInputValue }
)(App);
