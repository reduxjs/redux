import React, { PropTypes } from 'react';

function hsvToRgb(h, s, v) {
  const i = Math.floor(h);
  const f = h - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const mod = i % 6;
  const r = [v, q, p, p, t, v][mod];
  const g = [t, v, v, q, p, p][mod];
  const b = [p, p, t, v, v, q][mod];

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function colorFromString(token) {
  token = token.split('');
  token = token.concat(token.reverse());
  const number = token
    .reduce((sum, char) => sum + char.charCodeAt(0), 0) *
    Math.abs(Math.sin(token.length));

  const h = Math.round((number * (180 / Math.PI) * token.length) % 360);
  const s = number % 100 / 100;
  const v = 1;

  return hsvToRgb(h, s, v);
}


export default class ReduxMonitorEntry {
  static propTypes = {
    index: PropTypes.number.isRequired,
    state: PropTypes.object.isRequired,
    action: PropTypes.object.isRequired,
    select: PropTypes.func.isRequired,
    errorText: PropTypes.string,
    onActionClick: PropTypes.func.isRequired,
    collapsed: PropTypes.bool
  };

  printState(state, errorText) {
    if (!errorText) {
      try {
        return JSON.stringify(this.props.select(state));
      } catch (err) {
        errorText = 'Error selecting state.';
      }
    }

    return (
      <span style={{
        fontStyle: 'italic'
      }}>
        ({errorText})
      </span>
    );
  }

  handleActionClick(e) {
    const { index, onActionClick } = this.props;
    onActionClick(index, e.ctrlKey || e.metaKey);
  }

  render() {
    const { index, errorText, action, state, collapsed, onActionClick } = this.props;
    const { type = '' } = action;
    const { r, g, b } = colorFromString(action.type);

    return (
      <div style={{
        textDecoration: collapsed ? 'line-through' : 'none'
      }}>
        <a onClick={::this.handleActionClick}
           style={{
             opacity: collapsed ? 0.5 : 1,
             marginTop: '1em',
             display: 'block',
             paddingBottom: '1em',
             paddingTop: '1em',
             color: `rgb(${r}, ${g}, ${b})`,
             cursor: 'hand',
             WebkitUserSelect: 'none'
           }}>
          {JSON.stringify(action)}
        </a>

        {!collapsed &&
          <p style={{
            textAlign: 'center',
            transform: 'rotate(180deg)'
          }}>
            ⇧
          </p>
        }

        {!collapsed &&
          <div style={{
            paddingBottom: '1em',
            paddingTop: '1em',
            color: 'lightyellow'
          }}>
            {this.printState(state, errorText)}
          </div>
        }

        <hr style={{
          marginBottom: '2em'
        }} />
      </div>
    );
  }
}
