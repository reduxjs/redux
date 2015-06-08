import React, { PropTypes } from 'react';
import { Connector } from 'redux';
import Transactions from '../components/Transactions';

export default class TransactionsApp {
  static propTypes = {
    transactor: PropTypes.func
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
