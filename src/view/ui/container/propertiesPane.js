import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';

import Pane from '../component/pane';
import EntityProperties from './properties/entity';
import TextureProperties from './properties/texture';
import GeometryProperties from './properties/geometry';
import ShaderProperties from './properties/shader';
import MaterialProperties from './properties/material';

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
    if (selectedType == null) return false;
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
  'editor.select': true,
  'network.connect': true
}, (engine) => ({
  selected: engine.systems.editor.getSelf().selected,
  selectedType: engine.systems.editor.getSelf().selectedType
}))(PropertiesPane);
