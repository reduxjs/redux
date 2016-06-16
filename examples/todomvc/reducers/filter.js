import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../constants/TodoFilters'

const filter = (state = 'SHOW_ALL', action) => {
	console.log(state, action);
	switch (action.type) {
		case SHOW_COMPLETED:
			return action.type
		case SHOW_ACTIVE:
			return action.type
		case SHOW_ALL:
			return action.type
		default:
			return 'SHOW_ALL'
	}
}

export default filter

