import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class Section extends Component {
  render() {
    const { header, children, className } = this.props;
    return (
      <div className={classNames('section-component', className)}>
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

Section.propTypes = {
  header: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string
};
