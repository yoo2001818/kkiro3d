import React, { Component, PropTypes, cloneElement } from 'react';
import connect from '../util/connect';

import DropDown from '../component/ui/dropDown';
import Pane from '../component/pane';
import EntityList from './list/entity';
import RenderAssetList from './list/renderAsset';

import ModalDialog from '../component/modal/dialog';

const TYPES = {
  entity: {
    name: 'Entities',
    component: <EntityList />,
    add: function() {
      this.props.execute('editor.createEntity',
        this.props.engine.systems.editor.getId(), undefined);
    }
  },
  /* component: {
    name: 'Components'
  },
  system: {
    name: 'Systems'
  },
  view: {
    name: 'Views'
  }, */
  geometry: {
    name: 'Geometries',
    component: <RenderAssetList type='geometry' />
  },
  shader: {
    name: 'Shaders',
    component: <RenderAssetList type='shader' />
  },
  texture: {
    name: 'Textures',
    component: <RenderAssetList type='texture' />
  },
  material: {
    name: 'Materials',
    component: <RenderAssetList type='material' />,
    add: function() {
      // TODO Put this in a form to make 'Enter' key work.... However,
      // there's no way to call 'onClose' :(
      let input;
      this.props.executeLocal('ui.setModal',
        <ModalDialog title='Add new Material' actions={[
          {name: 'OK', onClick: () => {
            let val = input.value;
            if (val != '') this.props.execute('renderer.material.add', val, {});
          }},
          {name: 'Cancel', type: 'red'}
        ]}>
          <input type='text' placeholder='Name' ref={v => input = v}/>
        </ModalDialog>
      );
    }
  }
};

class OutlinePane extends Component {
  handleAdd() {
    const { outlineType } = this.props;
    const outlineData = TYPES[outlineType];
    outlineData.add.call(this);
  }
  handleType(type) {
    this.props.execute('editor.setType',
      this.props.engine.systems.editor.getId(), type);
  }
  handleSelect(selected) {
    this.props.execute('editor.select',
      this.props.engine.systems.editor.getId(),
      this.props.outlineType, selected);
  }
  render() {
    const { selected, selectedType, outlineType } = this.props;
    if (outlineType == null) return false;
    const outlineData = TYPES[outlineType];
    return (
      <Pane className='outline-pane'
        header={<div className='header-content'>
          <div className='title'>
            <DropDown title={outlineData.name}
              className='left small select-list'
            ><ul>
              {Object.keys(TYPES).map((value, i) => (
                <li key={i}
                  className={value === outlineType && 'selected'}
                >
                  <a href='#' onClick={this.handleType.bind(this, value)}>
                    {TYPES[value].name}
                  </a>
                </li>
              ))}
            </ul></DropDown>
          </div>
          { outlineData.add && (
            <div className='add-button' onClick={this.handleAdd.bind(this)}
              title='Add' />
          )}
        </div>}
      >
        {cloneElement(outlineData.component, {
          selected: selectedType === outlineType ? selected : null,
          onSelect: this.handleSelect.bind(this)
        })}
      </Pane>
    );
  }
}

OutlinePane.propTypes = {
  execute: PropTypes.func,
  executeLocal: PropTypes.func,
  engine: PropTypes.object,
  selected: PropTypes.any,
  selectedType: PropTypes.string,
  outlineType: PropTypes.string
};

export default connect({
  'editor.setType': true,
  'editor.select': true,
  'network.connect': true
}, (engine) => ({
  execute: engine.actions.external.execute,
  executeLocal: engine.actions.external.executeLocal,
  engine,
  selected: engine.systems.editor.getSelf().selected,
  selectedType: engine.systems.editor.getSelf().selectedType,
  outlineType: engine.systems.editor.getSelf().outlineType
}))(OutlinePane);
