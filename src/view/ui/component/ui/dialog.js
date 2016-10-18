import React, { Component, PropTypes } from 'react';

export default class Dialog extends Component {
  render() {
    const { title, children } = this.props;
    return (
      <div className='dialog-component'>
        <h1 className='title'>
          {title}
        </h1>
        <div className='content'>
          {children}
        </div>
      </div>
    );
  }
}

Dialog.propTypes = {
  title: PropTypes.node,
  children: PropTypes.node
};

export class Controls extends Component {
  render() {
    return (
      <div className='dialog-controls-component'>
        {this.props.children}
      </div>
    );
  }
}

Controls.propTypes = {
  children: PropTypes.node
};
