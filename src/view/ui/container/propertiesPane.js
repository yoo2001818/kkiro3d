import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';

import Pane from '../component/pane';
import EntityProperties from './entityProperties';
import TextureProperties from './textureProperties';
import GeometryProperties from './geometryProperties';
import ShaderProperties from './shaderProperties';
import MaterialProperties from './materialProperties';

const TYPES = {
  entity: EntityProperties,
  texture: TextureProperties,
  geometry: GeometryProperties,
  shader: ShaderProperties,
  material: MaterialProperties
};

class PropertiesPane extends Component {
  render() {
    const { selected, selectedType } = this.props;
    const Component = TYPES[selectedType];
    return (
      <Pane header='Properties' className='properties-pane'>
        <Component selected={selected} />
      </Pane>
    );
  }
}

PropertiesPane.propTypes = {
  selected: PropTypes.any,
  selectedType: PropTypes.string
};

export default connect({
  'editor.select': true
}, ({ state }) => ({
  selected: state.global.selected,
  selectedType: state.global.selectedType
}))(PropertiesPane);
