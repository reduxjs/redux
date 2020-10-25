import React from 'react'

const List = ({
  isFetching = true,
  nextPageUrl,
  pageCount,
  items,
  renderItem,
  loadingLabel = 'Loading...',
  onLoadMoreClick
}) => {
  const isEmpty = items.length === 0
  const isLastPage = !nextPageUrl
  if (isEmpty && isFetching) {
    return (
      <h2>
        <i>{loadingLabel}</i>
      </h2>
    )
  }

  if (isEmpty && isLastPage) {
    return (
      <h1>
        <i>Nothing here!</i>
      </h1>
    )
  }

  return (
    <div>
      {items.map(renderItem)}
      {pageCount > 0 && !isLastPage && (
        <button
          style={{ fontSize: '150%' }}
          onClick={onLoadMoreClick}
          disabled={isFetching}
        >
          {isFetching ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}

export default List
