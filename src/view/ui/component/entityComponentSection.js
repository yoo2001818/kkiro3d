import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import Section from './section';

export default class EntityComponentSection extends Component {
  handleRemove() {
    if (this.props.onRemove) this.props.onRemove();
  }
  render() {
    const { header, className, children } = this.props;
    return (
      <Section className={classNames('entity-component', className)} header={
        <div className='header-content'>
          <div className='title'>{header}</div>
          <div className='remove-button' onClick={this.handleRemove.bind(this)}
            title='Remove' />
        </div>
      }>
        { children }
      </Section>
    );
  }
}

EntityComponentSection.propTypes = {
  children: PropTypes.node,
  header: PropTypes.string,
  className: PropTypes.string,
  onRemove: PropTypes.func
};
