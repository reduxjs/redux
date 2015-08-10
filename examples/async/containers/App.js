import React, { Component, PropTypes } from 'react';
import Explore from '../components/Explore';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  render() {
    // Injected by React Router
    const { location, children } = this.props;
    const { pathname } = location;
    const value = pathname.substring(1);

    return (
      <div>
        <Explore value={value}
                 onChange={this.handleChange} />
        <hr />
        {children}
      </div>
    );
  }

  handleChange(nextValue) {
    // Available thanks to contextTypes below
    const { router } = this.context;
    router.transitionTo(`/${nextValue}`);
  }
}

App.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }),
  params: PropTypes.shape({
    userLogin: PropTypes.string,
    repoName: PropTypes.string
  }).isRequired
};

App.contextTypes = {
  router: PropTypes.object.isRequired
};
