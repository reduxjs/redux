import React, { PropTypes } from 'react';
import DOMify from 'react-domify';

export default class Transactions {
  static propTypes = {
    status: PropTypes.object.isRequired,
    commit: PropTypes.func.isRequired,
    begin: PropTypes.func.isRequired,
    rollback: PropTypes.func.isRequired
  };

  render() {
    const { status, commit, begin, rollback } = this.props;

    return (
      <p>
        <button onClick={begin}>Begin</button>
        <button onClick={commit}>Commit</button>
        <button onClick={rollback}>Rollback</button>
        <DOMify value={status} />
      </p>
    );
  }
}
