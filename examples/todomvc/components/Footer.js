import React, { PropTypes } from 'react'
import * as TodoFilters from '../constants/TodoFilters'
import Link from './Link'

const Footer = ({ 
  activeCount,
  completedCount,
  onShow, 
  onClearCompleted, 
  visibilityFilter 
}) => {
  const itemWord = activeCount === 1 ? 'item' : 'items'

  const links = [
    { id: TodoFilters.SHOW_ALL, displayName: 'All' },
    { id: TodoFilters.SHOW_ACTIVE, displayName: 'Active' },
    { id: TodoFilters.SHOW_COMPLETED, displayName: 'Completed' }
  ]

  return (
    <footer className="footer">
      <span className="todo-count">
        <strong>{activeCount || 'No'}</strong> {itemWord} left
      </span>

      <ul className="filters">
        {
          links.map(link => 
            <Link key={link.id}
                  filter={link.id}
                  active={link.id === visibilityFilter}
                  onClick={() => { onShow(link.id) }}
            >
              {link.displayName}
            </Link>
          )
        }
      </ul>

      { (completedCount > 0) ? 
        <button className="clear-completed"
                onClick={() => onClearCompleted()}>
          Clear completed
        </button>
        : null 
      }
    </footer>
  )
}

Footer.propTypes = {
  activeCount: PropTypes.number.isRequired,
  completedCount: PropTypes.number.isRequired,
  onShow: PropTypes.func.isRequired,
  onClearCompleted: PropTypes.func.isRequired,
  visibilityFilter: PropTypes.string.isRequired
}

export default Footer
