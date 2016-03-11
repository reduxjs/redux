import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { selectReddit, fetchPostsIfNeeded, invalidateReddit } from '../actions'
import Picker from '../components/Picker'
import Posts from '../components/Posts'

class Reddit extends Component {

  static contextTypes = {
    router: PropTypes.object
  }

  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleRefreshClick = this.handleRefreshClick.bind(this)
  }

  static fetchData(dispatch, params) {
    const subreddit = params.id
    if (subreddit) {
      return Promise.all([
        dispatch(selectReddit(subreddit)),
        dispatch(fetchPostsIfNeeded(subreddit))
      ])
    } else {
      return Promise.resolve()
    }
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch, params } = this.props

    if (nextProps.params.id !== params.id) {
      dispatch(selectReddit(nextProps.params.id))
      if (nextProps.params.id) {
        dispatch(fetchPostsIfNeeded(nextProps.params.id))
      }
    }

  }

  handleChange(nextReddit) {
    this.context.router.push(`/${nextReddit}`)
  }

  handleRefreshClick(e) {
    e.preventDefault()

    const { dispatch, selectedReddit } = this.props
    dispatch(invalidateReddit(selectedReddit))
    dispatch(fetchPostsIfNeeded(selectedReddit))
  }

  render() {
    const { selectedReddit, posts, isFetching, lastUpdated } = this.props
    const isEmpty = posts.length === 0
    return (
      <div>
        <Picker value={selectedReddit}
                onChange={this.handleChange}
                options={ [ '', 'reactjs', 'frontend' ] } />
        <p>
          {lastUpdated &&
            <span>
            Last updated at {new Date(lastUpdated).toLocaleTimeString()}.
            {' '}
            </span>
          }
          {!isFetching && selectedReddit &&
            <a href="#"
               onClick={this.handleRefreshClick}>
              Refresh
            </a>
          }
        </p>
        {isEmpty
          ? (isFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>)
          : <div style={{ opacity: isFetching ? 0.5 : 1 }}>
              <Posts posts={posts}/>
            </div>
        }
      </div>
    )
  }
}

Reddit.propTypes = {
  selectedReddit: PropTypes.string.isRequired,
  posts: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { selectedReddit, postsByReddit } = state
  const {
    isFetching,
    lastUpdated,
    items: posts
  } = postsByReddit[selectedReddit] || {
    isFetching: false,
    items: []
  }

  return {
    selectedReddit,
    posts,
    isFetching,
    lastUpdated
  }
}

export default connect(mapStateToProps)(Reddit)
