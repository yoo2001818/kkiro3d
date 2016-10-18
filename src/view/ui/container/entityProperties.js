import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';

import EntityActions from './entityActions';
import EntityComponentName from './entityComponent/name';
import * as EntityComponents from './entityComponent';

// let componentList = ['name', 'transform', 'mesh'];

// EntityProperties should react to component add / remove, nothing else.
class EntityProperties extends Component {
  render() {
    const { entity } = this.props;
    if (entity == null) return false;
    return (
      <div className='entity-properties'>
        <EntityActions entity={entity} />
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
  entity: PropTypes.object
};

let checkUpdate = ([entity], { entity: propEntity }) => entity === propEntity;

export default connect({
  'entity.add.*': checkUpdate,
  'entity.remove.*': checkUpdate,
  'entity.delete': checkUpdate
}, (engine, { entity: propEntity }) => ({
  // This happens because fudge objects are mutable :/
  entity: engine.state.entities[propEntity.id]
}))(EntityProperties);
