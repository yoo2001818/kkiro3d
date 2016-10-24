import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';

import FilterList from '../../component/filterList';

class ShaderList extends Component {
  handleClick(entity) {
    // this.props.execute('editor.selectEntity', entity);
  }
  render() {
    const { shaders } = this.props;
    return (
      <FilterList data={ Object.keys(shaders).map((shader) => ({
        name: shader
      }))} />
    );
  }
}

ShaderList.propTypes = {
  shaders: PropTypes.object,
  selected: PropTypes.number,
  execute: PropTypes.func
};

export default connect({
  'renderer.shader.*': true,
  'external.load': true
}, ({ state, actions, systems }) => ({
  shaders: systems.renderer.shaders,
  selected: state.global.selectedEntity,
  execute: actions.external.execute
}))(ShaderList);
