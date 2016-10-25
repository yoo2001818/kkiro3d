import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class Field extends Component {
  render() {
    const { label, children, className } = this.props;
    return (
      <div className={classNames('field-component', className)}>
        <span className='label'>
          {label}
        </span>
        <span className='content'>
          {children}
        </span>
      </div>
    );
  }
}

Field.propTypes = {
  label: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string
};
