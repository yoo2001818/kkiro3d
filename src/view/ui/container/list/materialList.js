import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';

import FilterList from '../../component/filterList';

class MaterialList extends Component {
  handleClick(entity) {
    // this.props.execute('editor.selectEntity', entity);
  }
  render() {
    const { materials } = this.props;
    return (
      <FilterList data={ Object.keys(materials).map((material) => ({
        name: material
      }))} />
    );
  }
}

MaterialList.propTypes = {
  materials: PropTypes.object,
  selected: PropTypes.number,
  execute: PropTypes.func
};

export default connect({
  'renderer.material.*': true,
  'external.load': true
}, ({ state, actions, systems }) => ({
  materials: systems.renderer.materials,
  selected: state.global.selectedEntity,
  execute: actions.external.execute
}))(MaterialList);
