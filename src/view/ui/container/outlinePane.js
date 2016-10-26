import React, { Component, PropTypes, cloneElement } from 'react';
import connect from '../util/connect';

import DropDown from '../component/ui/dropDown';
import Pane from '../component/pane';
import EntityList from './list/entity';
import RenderAssetList from './list/renderAsset';

const TYPES = {
  entity: {
    name: 'Entities',
    component: <EntityList />
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
    component: <RenderAssetList type='geometries' />
  },
  shader: {
    name: 'Shaders',
    component: <RenderAssetList type='shaders' />
  },
  texture: {
    name: 'Textures',
    component: <RenderAssetList type='textures' />
  },
  material: {
    name: 'Materials',
    component: <RenderAssetList type='materials' />
  }
};

class OutlinePane extends Component {
  handleAdd() {
    this.props.execute('editor.createEntity', {});
  }
  handleType(type) {
    this.props.execute('editor.setType', type);
  }
  handleSelect(selected) {
    this.props.execute('editor.select', this.props.outlineType, selected);
  }
  render() {
    const { selected, selectedType, outlineType } = this.props;
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
          <div className='add-button' onClick={this.handleAdd.bind(this)}
            title='Add' />
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
  selected: PropTypes.any,
  selectedType: PropTypes.string,
  outlineType: PropTypes.string
};

export default connect({
  'editor.setType': true,
  'editor.select': true
}, (engine) => ({
  execute: engine.actions.external.execute,
  selected: engine.state.global.selected,
  selectedType: engine.state.global.selectedType,
  outlineType: engine.state.global.outlineType
}))(OutlinePane);
