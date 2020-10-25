import React from 'react'

const GITHUB_REPO = 'https://github.com/reduxjs/redux'

const Explore = ({ onChange, value }) => {
  const inputRef = React.useRef(null)

  React.useEffect(() => {
    inputRef.current.value = value
  }, [value])

  const handleGoClick = () => {
    onChange(inputRef.current.value)
  }

  const handleKeyUp = e => {
    if (e.keyCode === 13) {
      handleGoClick()
    }
  }

  return (
    <div>
      <p>Type a username or repo full name and hit 'Go':</p>
      <input
        size="45"
        ref={inputRef}
        defaultValue={value}
        onKeyUp={handleKeyUp}
      />
      <button onClick={handleGoClick}>Go!</button>
      <p>
        Code on{' '}
        <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
          Github
        </a>
        .
      </p>
      <p>Move the DevTools with Ctrl+W or hide them with Ctrl+H.</p>
    </div>
  )
}

export default Explore
