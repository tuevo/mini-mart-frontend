import { LOGIN_SUCCESS } from '../actions/types.action';

export default function (state = {}, action) {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        user: action.user,
        token: action.token
      }
    default:
      return state;
  }
}