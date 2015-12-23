import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Counter from '../components/Counter'
import * as CounterActions from '../actions/counter'

function mapStateToProps(state) {
  // Pick only the state that matters to Counter component
  return {
    counter: state.counter
  }
}

function mapDispatchToProps(dispatch) {
  // Wrap dispatch between the Counter action creators, so we can call them directly
  return bindActionCreators(CounterActions, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Counter)
