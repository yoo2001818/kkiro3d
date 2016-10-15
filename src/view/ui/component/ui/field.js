import React, { Component, PropTypes } from 'react';

export default class Field extends Component {
  render() {
    const { label, children } = this.props;
    return (
      <div className='field-component'>
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
  children: PropTypes.node
};
