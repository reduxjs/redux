import React from 'react'
import Explore from '../components/Explore'
import { resetErrorMessage } from '../actions'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'

const App = ({ children }) => {
  const dispatch = useDispatch()
  const errorMessage = useSelector(state => state.errorMessage)
  let location = useLocation()

  const inputValue = location.pathname.substring(1)

  let history = useHistory()

  const handleChange = nextValue => {
    history.push(`/${nextValue}`)
  }

  const handleDismissClick = e => {
    dispatch(resetErrorMessage())
    e.preventDefault()
  }

  return (
    <div>
      <Explore value={inputValue} onChange={handleChange} />
      <hr />
      {errorMessage && (
        <p style={{ backgroundColor: '#e99', padding: 10 }}>
          <b>{errorMessage}</b>{' '}
          <button onClick={handleDismissClick}>Dismiss</button>
        </p>
      )}
      {children}
    </div>
  )
}

export default App
