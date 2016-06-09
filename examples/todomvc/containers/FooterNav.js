import { connect } from 'react-redux'
import { clearCompleted, setVisibilityFilter } from '../actions'
import { getActiveCount, getCompletedCount } from '../selectors'
import Footer from '../components/Footer'

const mapStateToProps = (state) => {
  return {
    activeCount: getActiveCount(state),
    completedCount: getCompletedCount(state),
    visibilityFilter: state.visibilityFilter
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onShow: (id) => {
      dispatch(setVisibilityFilter(id))
    },
    onClearCompleted: () => {
      dispatch(clearCompleted())
    }
  }
}

const FooterNav = connect(
  mapStateToProps,
  mapDispatchToProps
)(Footer)

export default FooterNav
