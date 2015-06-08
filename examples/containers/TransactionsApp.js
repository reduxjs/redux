import React, { PropTypes } from 'react';
import { Connector } from 'redux';
import Transactions from '../components/Transactions';

const transactorShape = PropTypes.shape({
  getStatus: PropTypes.func.isRequired,
  begin: PropTypes.func.isRequired,
  commit: PropTypes.func.isRequired,
  rollback: PropTypes.func.isRequired
});

export default class TransactionsApp {
  static propTypes = {
    transactor: transactorShape.isRequired
  };

  render() {
    return (
      // TODO: Need a way to subscribe to all dispatches, without memoization
      <Connector select={() => ({ lol: {} })}>
        {::this.renderChild}
      </Connector>
    );
  }

  renderChild() {
    const { transactor: { getStatus, begin, commit, rollback } } = this.props;

    return (
      <Transactions status={getStatus()}
                    commit={commit}
                    begin={begin}
                    rollback={rollback} />
    );
  }
}
