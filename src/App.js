import React, { Component } from 'react'
import 'antd/dist/antd.css';
import './assets/styles/animate.min.css';
import Login from './components/pages/User/Login/Login';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux';
import store from './redux/store';
import Main from './components/layout/Main/Main';
import AppLoading from './components/utilities/AppLoading/AppLoading';

export default class App extends Component {

  render() {
    return (
      <Provider store={store}>
        <CookiesProvider>
          <BrowserRouter>
            <Switch>
              <Route path='/login' component={Login} />
              <Route path='/' component={Main} />
              <Route
                path='/**'
                render={() => {
                  return (
                    <Redirect
                      to={{
                        pathname: '/'
                      }}
                    />
                  );
                }}
              />
            </Switch>
            <AppLoading />
          </BrowserRouter>
        </CookiesProvider>
      </Provider>
    )
  }
}
