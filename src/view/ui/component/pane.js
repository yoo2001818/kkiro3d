import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class Pane extends Component {
  render() {
    const { header, children, className } = this.props;
    return (
      <div className={classNames('pane', className)}>
        <div className='header'>
          { header }
        </div>
        <div className='content'>
          { children }
        </div>
      </div>
    );
  }
}

Pane.propTypes = {
  header: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string
};
