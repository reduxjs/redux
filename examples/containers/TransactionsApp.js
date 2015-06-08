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
      <Connector select={state => {
        return { status: state.transactorStatus };
      }}>
        {::this.renderChild}
      </Connector>
    );
  }

  renderChild({ status }) {
    const { transactor: { begin, commit, rollback } } = this.props;

    return (
      <Transactions status={status}
                    commit={commit}
                    begin={begin}
                    rollback={rollback} />
    );
  }
}
