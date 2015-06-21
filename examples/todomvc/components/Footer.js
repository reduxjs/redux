import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { SHOW_ALL, SHOW_MARKED, SHOW_UNMARKED } from '../constants/Show';

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
            <a className={classnames({ selected: this.props.showing === SHOW_ALL})}
               onClick={(e) => this.props.onShow(e, SHOW_ALL)}>
              All
            </a>
          </li>
          {' '}
          <li>
            <a className={classnames({ selected: this.props.showing === SHOW_UNMARKED})}
               onClick={(e) => this.props.onShow(e, SHOW_UNMARKED)} >
              Active
            </a>
          </li>
          {' '}
          <li>
            <a className={classnames({ selected: this.props.showing === SHOW_MARKED})}
               onClick={(e) => this.props.onShow(e, SHOW_MARKED)} >
              Completed
            </a>
          </li>
        </ul>
        {clearButton}
      </footer>
    );
  }
}
