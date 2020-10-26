import React from 'react'
import Explore from '../components/Explore'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import errorMessageSlice from '../reducers/errorMessage.slice'

const App = ({ children }) => {
  const location = useLocation()
  const history = useHistory()
  const dispatch = useDispatch()
  const errorMessage = useSelector(state => state.errorMessage.message)

  const inputValue = location.pathname.substring(1)

  return (
    <div>
      <Explore
        value={inputValue}
        onChange={nextValue => {
          history.push(`/${nextValue}`)
        }}
      />
      <hr />
      {errorMessage && (
        <p style={{ backgroundColor: '#e99', padding: 10 }}>
          <b>{errorMessage}</b>{' '}
          <button
            onClick={() => {
              dispatch(errorMessageSlice.actions.reset())
            }}
          >
            Dismiss
          </button>
        </p>
      )}
      {children}
    </div>
  )
}

export default App
