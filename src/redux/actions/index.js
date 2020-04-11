import { APP_LOADING, LOGIN_SUCCESS, SET_CURRENT_PAGE_TITLE, SET_SIDEBAR_SELECTED_INDEX } from './types.action';

// App authentication
export const login = (user, token) => ({ type: LOGIN_SUCCESS, user, token });

// App utilities
export const setAppLoading = (isLoading) => ({ type: APP_LOADING, isLoading });
export const setCurrentPageTitle = (title, icon) => ({ type: SET_CURRENT_PAGE_TITLE, title, icon });
export const setSidebarSelectedIndex = (sidebarSelectedIndex) => ({ type: SET_SIDEBAR_SELECTED_INDEX, sidebarSelectedIndex });