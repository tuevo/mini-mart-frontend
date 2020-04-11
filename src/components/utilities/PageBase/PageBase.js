import React from 'react';

export default class BasePage extends React.Component {
  abortController = new AbortController();

  componentWillUnmount() {
    this.abortController.abort();
  }
}