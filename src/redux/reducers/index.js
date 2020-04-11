import { combineReducers } from 'redux';
import appReducer from './app.reducer';
import loggedInUserReducer from './logged-in-user.reducer';

export default combineReducers({
  app: appReducer,
  loggedInUser: loggedInUserReducer
});
