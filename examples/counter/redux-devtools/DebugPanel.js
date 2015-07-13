import React, { PropTypes } from 'react';

export default class DebugPanel {
  static propTypes = {
    left: PropTypes.bool,
    right: PropTypes.bool,
    bottom: PropTypes.bool,
    top: PropTypes.bool
  };

  render() {
    if (process.env.NODE_ENV === 'production') {
      return null;
    }

    let { left, right, bottom, top } = this.props;
    if (typeof left === 'undefined' && typeof right === 'undefined') {
      right = true;
    }
    if (typeof top === 'undefined' && typeof bottom === 'undefined') {
      bottom = true;
    }

    return (
      <div style={{
        position: 'fixed',
        zIndex: 999,
        fontSize: 17,
        overflow: 'scroll',
        opacity: 0.92,
        background: 'black',
        color: 'white',
        padding: '1em',
        left: left ? 0 : undefined,
        right: right ? 0 : undefined,
        top: top ? 0 : undefined,
        bottom: bottom ? 0 : undefined,
        maxHeight: (bottom && top) ? '100%' : '20%',
        maxWidth: (left && right) ? '100%' : '20%',
        wordWrap: 'break-word'
      }}>
        {this.props.children}
      </div>
    );
  }
}
