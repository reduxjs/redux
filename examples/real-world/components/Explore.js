import React, { Component, PropTypes } from 'react';

const GITHUB_REPO = 'https://github.com/rackt/redux';

export default class Explore extends Component {
  constructor(props) {
    super(props);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.setInputValue = this.setInputValue.bind(this);
  }

  setInputValue(event) {
    this.props.setInputValue(event.target.value);
  }

  handleKeyUp(e) {
    if (e.keyCode === 13) {
      this.props.handleGoClick();
    }
  }

  render() {
    return (
      <div>
        <p>Type a username or repo full name and hit 'Go':</p>
        <input size="45"
               value={this.props.value}
               onChange={this.setInputValue}
               onKeyUp={this.handleKeyUp} />
        <button onClick={this.props.handleGoClick}>
          Go!
        </button>
        <p>
          Code on <a href={GITHUB_REPO} target="_blank">Github</a>.
        </p>
      </div>
    );
  }
}

Explore.propTypes = {
  value: PropTypes.string.isRequired,
  handleGoClick: PropTypes.func.isRequired,
  setInputValue: PropTypes.func.isRequired
};
