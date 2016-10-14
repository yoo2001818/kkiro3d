import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class EntityComponent extends Component {
  render() {
    const { header, children, className } = this.props;
    return (
      <div className={classNames('entity-component', className)}>
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

EntityComponent.propTypes = {
  header: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string
};
