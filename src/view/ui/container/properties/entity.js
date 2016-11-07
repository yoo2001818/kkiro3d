import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';

import EntityActions from '../entityActions';
import EntityComponentName from '../entity/component/name';
import getComponent from '../entity/registry';

import ModalContext from '../../component/modal/context';
import ComponentList from '../list/component';

// let componentList = ['name', 'transform', 'mesh'];

// EntityProperties should react to component add / remove, nothing else.
class EntityProperties extends Component {
  handleAdd(name) {
    this.props.execute('entity.add.' + name, this.props.entity, undefined);
  }
  handleAddOpen() {
    this.props.executeLocal('ui.setModal', this.renderAdd.bind(this));
  }
  renderAdd(onClose) {
    const { entity } = this.props;
    return (
      <ModalContext alignTo={this.addOpen} onClose={onClose}>
        <div className='popup-menu'>
          <ComponentList
            filter={name => entity[name] == null}
            onSelect={name => {
              onClose();
              this.handleAdd(name);
            }}
          />
        </div>
      </ModalContext>
    );
  }
  render() {
    const { engine, entity } = this.props;
    if (entity == null) return false;
    return (
      <div className='entity-properties properties'>
        <EntityActions entity={entity} />
        <EntityComponentName entity={entity} />
        { Object.keys(entity).map(name => {
          // Get component metadata
          let metadata = engine.components.store[name];
          if (metadata == null) return false;
          let Component = getComponent(name, metadata.data);
          if (Component == null) return false;
          return (
            <Component entity={entity} key={name} />
          );
        }) }
        <div className='add-component'>
          <button className='button-component'
            onClick={this.handleAddOpen.bind(this)}
            ref={node => this.addOpen = node}
          >
            Add Component
          </button>
        </div>
      </div>
    );
  }
}

EntityProperties.propTypes = {
  engine: PropTypes.object,
  entity: PropTypes.object,
  componentList: PropTypes.array,
  execute: PropTypes.func,
  executeLocal: PropTypes.func,
  selected: PropTypes.number
};

let checkUpdate = ([entity], { selected }) => entity.id === selected;

export default connect({
  'entity.add.*': checkUpdate,
  'entity.remove.*': checkUpdate,
  'entity.delete': checkUpdate
}, (engine, { selected }) => ({
  engine,
  // This happens because fudge objects are mutable :/
  entity: engine.state.entities[selected],
  // This should be provided as a global variable, but what the heck.
  componentList: engine.components.list,
  execute: engine.actions.external.execute,
  executeLocal: engine.actions.external.executeLocal
}))(EntityProperties);
