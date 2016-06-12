import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import * as actions from '../actions'
import Picker from './Picker'
import Posts from './Posts'

class App extends Component {
  constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleRefreshClick = this.handleRefreshClick.bind(this)
  }

  componentDidMount() {
    this.maybeFetchPosts()
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedReddit !== prevProps.selectedReddit) {
      this.maybeFetchPosts()
    }
  }

  maybeFetchPosts(invalidateCache = false) {
    const { selectedReddit } = this.props
    if (invalidateCache) {
      this.props.invalidateReddit(selectedReddit)
    }
    this.props.fetchPostsIfNeeded(selectedReddit)
  }

  handleChange(nextReddit) {
    this.props.selectReddit(nextReddit)
  }

  handleRefreshClick(e) {
    e.preventDefault()
    this.maybeFetchPosts(true)
  }

  render() {
    const { selectedReddit, posts, isFetching, lastUpdated } = this.props
    const isEmpty = posts.length === 0
    return (
      <div>
        <Picker value={selectedReddit}
                onChange={this.handleChange}
                options={[ 'reactjs', 'frontend' ]} />
        <p>
          {lastUpdated &&
            <span>
              Last updated at {new Date(lastUpdated).toLocaleTimeString()}.
              {' '}
            </span>
          }
          {!isFetching &&
            <a href="#"
               onClick={this.handleRefreshClick}>
              Refresh
            </a>
          }
        </p>
        {isEmpty
          ? (isFetching ? <h2>Loading...</h2> : <h2>Empty.</h2>)
          : <div style={{ opacity: isFetching ? 0.5 : 1 }}>
              <Posts posts={posts} />
            </div>
        }
      </div>
    )
  }
}

App.propTypes = {
  selectedReddit: PropTypes.string.isRequired,
  posts: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
  selectReddit: PropTypes.func.isRequired,
  invalidateReddit: PropTypes.func.isRequired,
  fetchPostsIfNeeded: PropTypes.func.isRequired
}

function mapStateToProps(state) {
  const { selectedReddit, postsByReddit } = state
  const {
    isFetching,
    lastUpdated,
    items: posts
  } = postsByReddit[selectedReddit] || {
    isFetching: true,
    items: []
  }

  return {
    selectedReddit,
    posts,
    isFetching,
    lastUpdated
  }
}

export default connect(mapStateToProps, actions)(App)
