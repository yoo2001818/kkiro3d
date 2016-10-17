import React, { Component, PropTypes } from 'react';

export default class Header extends Component {
  render() {
    return (
      <div className='header-component'>
        <div className='left'>
          { this.props.children }
        </div>
        <div className='right'>
          { this.props.right }
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  children: PropTypes.node,
  right: PropTypes.node
};
