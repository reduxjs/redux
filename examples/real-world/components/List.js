import React, { PropTypes } from 'react'

const LoadMore = ({ isFetching, onLoadMoreClick }) =>
  <button style={{ fontSize: '150%' }}
          onClick={onLoadMoreClick}
          disabled={isFetching}>
    {isFetching ? 'Loading...' : 'Load More'}
  </button>

const List = ({
  isFetching, nextPageUrl, pageCount,
  items, renderItem, loadingLabel,
  onLoadMoreClick
}) => {
  const isEmpty = items.length === 0
  if (isEmpty && isFetching) {
    return <h2><i>{loadingLabel}</i></h2>
  }

  const isLastPage = !nextPageUrl
  if (isEmpty && isLastPage) {
    return <h1><i>Nothing here!</i></h1>
  }

  return (
    <div>
      {items.map(renderItem)}
      {pageCount > 0 && !isLastPage &&
        <LoadMore isFetching={isFetching}
                  onLoadMoreClick={onLoadMoreClick} />
      }
    </div>
  )
}

List.propTypes = {
  loadingLabel: PropTypes.string.isRequired,
  pageCount: PropTypes.number,
  renderItem: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  onLoadMoreClick: PropTypes.func.isRequired,
  nextPageUrl: PropTypes.string
}

List.defaultProps = {
  isFetching: true,
  loadingLabel: 'Loading...'
}

export default List
