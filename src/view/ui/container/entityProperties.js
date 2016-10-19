import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';

import EntityActions from './entityActions';
import EntityComponentName from './entityComponent/name';
import * as EntityComponents from './entityComponent';

import DropDown from '../component/ui/dropDown';

import capitalize from '../../../util/capitalize';

// let componentList = ['name', 'transform', 'mesh'];

// EntityProperties should react to component add / remove, nothing else.
class EntityProperties extends Component {
  handleAdd(name) {
    this.props.execute('entity.add.' + name, this.props.entity, undefined);
  }
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
        <div className='add-component'>
          <DropDown className='top left small no-caret'
            title={<div className='button-component'>Add Component</div>}
          ><ul>
            { this.props.componentList.filter(name => entity[name] == null)
              .map(name => (
                <li key={name} onClick={this.handleAdd.bind(this, name)}>
                  <a href='#'>
                    {capitalize(name)}
                  </a>
                </li>
              ))
            }
          </ul></DropDown>
        </div>
      </div>
    );
  }
}

EntityProperties.propTypes = {
  entity: PropTypes.object,
  componentList: PropTypes.array,
  execute: PropTypes.func
};

let checkUpdate = ([entity], { entity: propEntity }) => entity === propEntity;

export default connect({
  'entity.add.*': checkUpdate,
  'entity.remove.*': checkUpdate,
  'entity.delete': checkUpdate
}, (engine, { entity: propEntity }) => ({
  // This happens because fudge objects are mutable :/
  entity: engine.state.entities[propEntity.id],
  // This should be provided as a global variable, but what the heck.
  componentList: engine.components.list,
  execute: engine.actions.external.execute
}))(EntityProperties);
