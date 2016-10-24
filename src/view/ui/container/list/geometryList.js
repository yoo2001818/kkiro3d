import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';
import classNames from 'classnames';

import FilterList from '../../component/filterList';

class GeometryList extends Component {
  handleSelect(geometry) {
    if (this.props.onSelect) this.props.onSelect(geometry);
  }
  render() {
    const { geometries, selected } = this.props;
    return (
      <FilterList data={ Object.keys(geometries).map((geometry) => ({
        name: geometry,
        className: classNames({ selected: geometry === selected }),
        onClick: this.handleSelect.bind(this, geometry)
      }))} />
    );
  }
}

GeometryList.propTypes = {
  geometries: PropTypes.object,
  selected: PropTypes.string,
  onSelect: PropTypes.func,
};

export default connect({
  'renderer.geometry.*': true,
  'external.load': true
}, ({ systems }) => ({
  geometries: systems.renderer.geometries
}))(GeometryList);
