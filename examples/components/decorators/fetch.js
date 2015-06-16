import React from 'react';

export default function fetch(fn) {
  return DecoratedComponent => class FetchDecorator extends React.Component {

    static propTypes = {
      actions: React.PropTypes.object.isRequired
    }

    componentWillMount () {
      fn(this.props.actions);
    }

    render() {
      return (
        <DecoratedComponent {...this.props} />
      );
    }
  };
}
