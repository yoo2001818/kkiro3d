import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';

import FilterList from '../../component/filterList';

class TextureList extends Component {
  handleClick(entity) {
    // this.props.execute('editor.selectEntity', entity);
  }
  render() {
    const { textures } = this.props;
    return (
      <FilterList data={ Object.keys(textures).map((texture) => ({
        name: texture
      }))} />
    );
  }
}

TextureList.propTypes = {
  textures: PropTypes.object,
  selected: PropTypes.number,
  execute: PropTypes.func
};

export default connect({
  'renderer.texture.*': true,
  'external.load': true
}, ({ state, actions, systems }) => ({
  textures: systems.renderer.textures,
  selected: state.global.selectedEntity,
  execute: actions.external.execute
}))(TextureList);
