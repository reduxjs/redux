import React from 'react';

export default function fetchOnUpdate(paramId, fn) {
  return DecoratedComponent =>
  class FetchOnUpdateDecorator extends React.Component {

    static propTypes = {
      actions: React.PropTypes.object.isRequired
    }

    componentWillMount () {
      fn(this.props.params[paramId], this.props.actions);
    }

    componentDidUpdate (prevProps) {
      const id = this.props.params[paramId];
      const newId = prevProps.params[paramId];
      if (id !== newId) {
        fn(id, this.props.actions);
      }
    }

    render() {
      return (
        <DecoratedComponent {...this.props} />
      );
    }
  };
}
