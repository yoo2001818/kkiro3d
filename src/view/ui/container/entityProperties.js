import React, { Component, PropTypes } from 'react';
import connect from '../util/connectFudge';

import EntityComponentName from './entityComponent/name';
import EntityComponentTransform from './entityComponent/transform';

// EntityProperties should react to component add / remove, nothing else.
class EntityProperties extends Component {
  render() {
    const { entity } = this.props;
    return (
      <div className='entity-properties'>
        <EntityComponentName entity={entity} />
        <EntityComponentTransform entity={entity} />
      </div>
    );
  }
}

EntityProperties.propTypes = {
  entity: PropTypes.object.isRequired
};

export default connect({
  'entity.add.*': ([entity], { entity: propEntity }) => entity === propEntity,
  'entity.remove.*': ([entity], { entity: propEntity }) => entity === propEntity
}, (engine, { entity: propEntity }) => ({
  // This happens because fudge objects are mutable :/
  entity: propEntity
}))(EntityProperties);
