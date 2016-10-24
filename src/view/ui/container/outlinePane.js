import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';

import DropDown from '../component/ui/dropDown';
import Pane from '../component/pane';
import EntityList from './list/entityList';
import ShaderList from './list/shaderList';
import GeometryList from './list/geometryList';
import TextureList from './list/textureList';
import MaterialList from './list/materialList';

const TYPES = {
  entity: {
    name: 'Entities',
    component: EntityList
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
    component: GeometryList
  },
  shader: {
    name: 'Shaders',
    component: ShaderList
  },
  texture: {
    name: 'Textures',
    component: TextureList
  },
  material: {
    name: 'Materials',
    component: MaterialList
  }
};

class OutlinePane extends Component {
  handleAdd() {
    this.props.execute('editor.create', {});
  }
  handleType(type) {
    this.props.execute('editor.setType', type);
  }
  render() {
    const outlineType = TYPES[this.props.outlineType];
    const OutlineComponent = outlineType.component;
    return (
      <Pane className='outline-pane'
        header={<div className='header-content'>
          <div className='title'>
            <DropDown title={outlineType.name}
              className='left small select-list'
            ><ul>
              {Object.keys(TYPES).map((value, i) => (
                <li key={i}
                  className={value === this.props.outlineType && 'selected'}
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
        <OutlineComponent />
      </Pane>
    );
  }
}

OutlinePane.propTypes = {
  execute: PropTypes.func,
  outlineType: PropTypes.string
};

export default connect({
  'editor.setType': true
}, (engine) => ({
  execute: engine.actions.external.execute,
  outlineType: engine.state.global.outlineType
}))(OutlinePane);
