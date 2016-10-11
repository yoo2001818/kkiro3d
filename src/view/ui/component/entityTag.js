import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class EntityTag extends Component {
  render() {
    const { entity, selected, onClick } = this.props;
    return (
      <div className={classNames('entity-tag', { selected })}
        onClick={onClick}
      >
        {entity.name}
      </div>
    );
  }
}

EntityTag.propTypes = {
  entity: PropTypes.object,
  selected: PropTypes.bool,
  onClick: PropTypes.func
};
