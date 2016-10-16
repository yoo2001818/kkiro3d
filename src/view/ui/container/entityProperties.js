import React, { Component, PropTypes } from 'react';
import connect from '../util/connectFudge';

import EntityComponentName from './entityComponent/name';
import * as EntityComponents from './entityComponent';

// let componentList = ['name', 'transform', 'mesh'];

// EntityProperties should react to component add / remove, nothing else.
class EntityProperties extends Component {
  render() {
    const { entity } = this.props;
    return (
      <div className='entity-properties'>
        <EntityComponentName entity={entity} />
        { Object.keys(entity).map(component => {
          let UIComponent = EntityComponents[component];
          if (UIComponent == null) return false;
          return (
            <UIComponent entity={entity} key={component} />
          );
        }) }
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
