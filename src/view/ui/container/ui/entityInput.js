import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';

import ModalInput from './modalInput';

// Remaps displayValue to entity's name.
class EntityInput extends Component {
  render() {
    const { entity, value } = this.props;
    return (
      <ModalInput displayValue={
        (entity && entity.name) || value || '(None)'
      } {...this.props} />
    );
  }
}

EntityInput.propTypes = {
  entity: PropTypes.object,
  value: PropTypes.any
};

let ACTION_VALIDATOR = ([entity], { value }) => entity === value;

export default connect({
  'entity.add.name': ACTION_VALIDATOR,
  'entity.remove.name': ACTION_VALIDATOR,
  'entity.create': ACTION_VALIDATOR,
  'entity.delete': ACTION_VALIDATOR,
  'name.set': ACTION_VALIDATOR
}, (engine, { value }) => ({
  entity: engine.state.entities[value]
}))(EntityInput);
