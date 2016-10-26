import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';

import EntityActions from '../entityActions';
import EntityComponentName from '../entityComponent/name';
import * as EntityComponents from '../entityComponent';

import ModalContext from '../../component/modal/context';
import FilterList from '../../component/filterList';

import capitalize from '../../../../util/capitalize';

// let componentList = ['name', 'transform', 'mesh'];

// EntityProperties should react to component add / remove, nothing else.
class EntityProperties extends Component {
  handleAdd(name) {
    this.props.execute('entity.add.' + name, this.props.entity, undefined);
  }
  handleAddOpen() {
    this.props.execute('ui.setModal', this.renderAdd.bind(this));
  }
  renderAdd(onClose) {
    const { entity } = this.props;
    return (
      <ModalContext alignTo={this.addOpen} onClose={onClose}>
        <div className='popup-menu'>
          <FilterList data={
            this.props.componentList.filter(name => entity[name] == null)
            .map(name => ({
              name: capitalize(name),
              onClick: () => {
                onClose();
                this.handleAdd(name);
              }
            }))}
          />
        </div>
      </ModalContext>
    );
  }
  render() {
    const { entity } = this.props;
    if (entity == null) return false;
    return (
      <div className='entity-properties properties'>
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
  entity: PropTypes.object,
  componentList: PropTypes.array,
  execute: PropTypes.func,
  selected: PropTypes.number
};

let checkUpdate = ([entity], { selected }) => entity.id === selected;

export default connect({
  'entity.add.*': checkUpdate,
  'entity.remove.*': checkUpdate,
  'entity.delete': checkUpdate
}, (engine, { selected }) => ({
  // This happens because fudge objects are mutable :/
  entity: engine.state.entities[selected],
  // This should be provided as a global variable, but what the heck.
  componentList: engine.components.list,
  execute: engine.actions.external.execute
}))(EntityProperties);
