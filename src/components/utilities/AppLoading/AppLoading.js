import React, { Component } from 'react';
import './AppLoading.style.scss';
import { Spin } from 'antd';
import * as actions from '../../../redux/actions';
import { connect } from 'react-redux';

class AppLoading extends Component {
  render() {
    return (
      this.props.app.isLoading ? (
        <div className="app-loading">
          <Spin size="large" />
        </div>
      ) : <></>
    )
  }
}

const mapStateToProps = (state) => ({
  app: state.app
});

export default connect(mapStateToProps, actions)(AppLoading);
