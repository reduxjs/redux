import React from 'react'
import { Provider } from 'react-redux'
import { fireEvent, render } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import Node from './Node'
import treeReducer from '../nodes/treeSlice'

const renderNode = () => {
  const store = configureStore({
    reducer: {
      tree: treeReducer
    },
    preloadedState: {
      tree: {
        0: { id: 0, counter: 3, childIds: [1, 2] },
        1: { id: 1, counter: 1, childIds: [] },
        2: { id: 2, counter: 20, childIds: [3] },
        3: { id: 3, counter: 2, childIds: [] }
      }
    }
  })
  return render(
    <Provider store={store}>
      <Node id={0}></Node>
    </Provider>
  )
}

describe('Node component', () => {
  test('should have a counter of 21 after increment on button click', () => {
    const { getAllByText, getByText } = renderNode()
    fireEvent.click(getAllByText('+')[2])

    expect(getByText('Counter: 21'))
  })

  test('should have a total of 5 nodes after on Add child click on id of 0', () => {
    const { getAllByText } = renderNode()
    fireEvent.click(getAllByText('Add child')[0])

    expect(getAllByText(/Counter: */).length).toBe(5)
  })

  test('should have a new node with a counter of 0 after Add child click', () => {
    const { getAllByText, getByText } = renderNode()
    fireEvent.click(getAllByText('Add child')[0])

    expect(getByText('Counter: 0'))
  })

  test('should have a total of 2 nodes after on remove link click on id of 2 ', () => {
    const { getAllByText } = renderNode()
    // first node doesn't have a remove link
    // so we grab the intended index subtracted by 1
    fireEvent.click(getAllByText(/×/)[1])

    expect(getAllByText(/Counter: */).length).toBe(2)
  })

  test('should have a total of 3 nodes after on remove link click on id of 3 ', () => {
    const { getAllByText } = renderNode()
    // first node doesn't have a remove link
    // so we grab the intended index subtracted by 1
    fireEvent.click(getAllByText(/×/)[2])

    expect(getAllByText(/Counter: */).length).toBe(3)
  })
})
