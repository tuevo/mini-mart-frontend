import { APP_LOADING, SET_CURRENT_PAGE_TITLE, SET_SIDEBAR_SELECTED_INDEX } from '../actions/types.action';

export default function (state = { isLoading: false }, action) {
	switch (action.type) {
		case APP_LOADING:
			return {
				...state,
				isLoading: action.isLoading
			};
		case SET_CURRENT_PAGE_TITLE:
			return {
				...state,
				currentPageTitle: action.title,
				currentPageIcon: action.icon,
			}
		case SET_SIDEBAR_SELECTED_INDEX:
			return {
				...state,
				sidebarSelectedIndex: action.sidebarSelectedIndex
			}
		default:
			return state;
	}
}