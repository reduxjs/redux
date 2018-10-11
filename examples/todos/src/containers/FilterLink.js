// @flow

import { connect } from 'react-redux'
import { setVisibilityFilter } from '../actions'
import Link from '../components/Link'
import type {Dispatch} from 'redux'

type OwnPropsType = {
  filter: string
}

type State = {
  visibilityFilter: string
}

const mapStateToProps = (state: State, ownProps: OwnPropsType) => ({
  active: ownProps.filter === state.visibilityFilter
})

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnPropsType) => ({
  onClick: () => dispatch(setVisibilityFilter(ownProps.filter))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Link)
