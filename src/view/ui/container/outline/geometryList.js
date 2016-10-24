import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';

import FilterList from '../../component/filterList';

class GeometryList extends Component {
  handleClick(entity) {
    // this.props.execute('editor.selectEntity', entity);
  }
  render() {
    const { geometries } = this.props;
    return (
      <FilterList data={ Object.keys(geometries).map((geometry) => ({
        name: geometry
      }))} />
    );
  }
}

GeometryList.propTypes = {
  geometries: PropTypes.object,
  selected: PropTypes.number,
  execute: PropTypes.func
};

export default connect({
  'renderer.geometry.*': true,
  'external.load': true
}, ({ state, actions, systems }) => ({
  geometries: systems.renderer.geometries,
  selected: state.global.selectedEntity,
  execute: actions.external.execute
}))(GeometryList);
