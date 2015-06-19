import React, { PropTypes } from 'react';
import classnames from 'classnames';

export default class Footer {
  static propTypes = {
    markedCount: PropTypes.number.isRequired,
    unmarkedCount: PropTypes.number.isRequired,
    showing: PropTypes.string.isRequired,
    onClearMarked: PropTypes.func.isRequired,
    onShow: PropTypes.func.isRequired
  }

  render() {
    let clearButton = null;
    let itemWord = this.props.unmarkedCount > 1 ? 'items' : 'item';

    if (this.props.markedCount > 0) {
      clearButton = (
        <button className='clear-completed'
                onClick={::this.props.onClearMarked} >
          Clear completed
        </button>
      );
    }

    return (
      <footer className='footer'>
        <span className='todo-count'>
          <strong>{this.props.unmarkedCount}</strong> {itemWord} left
        </span>
        <ul className='filters'>
          <li>
            <a className={classnames({ selected: this.props.showing === 'all'})}
               onClick={(e) => this.props.onShow(e, 'all')}>
              All
            </a>
          </li>
          {' '}
          <li>
            <a className={classnames({ selected: this.props.showing === 'unmarked'})}
               onClick={(e) => this.props.onShow(e, 'unmarked')} >
              Active
            </a>
          </li>
          {' '}
          <li>
            <a className={classnames({ selected: this.props.showing === 'marked'})}
               onClick={(e) => this.props.onShow(e, 'marked')} >
              Completed
            </a>
          </li>
        </ul>
        {clearButton}
      </footer>
    );
  }
}
