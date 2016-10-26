import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';
import classNames from 'classnames';

import FilterList from '../../component/filterList';

const PLURAL = {
  geometry: 'geometries',
  shader: 'shaders',
  texture: 'textures',
  material: 'materials'
};

class RenderAssetList extends Component {
  handleSelect(asset) {
    if (this.props.onSelect) this.props.onSelect(asset);
  }
  render() {
    const { assets, selected } = this.props;
    return (
      <FilterList data={ Object.keys(assets).map((asset) => ({
        name: asset,
        className: classNames({ selected: asset === selected }),
        onClick: this.handleSelect.bind(this, asset)
      }))} />
    );
  }
}

RenderAssetList.propTypes = {
  assets: PropTypes.object,
  type: PropTypes.string,
  selected: PropTypes.string,
  onSelect: PropTypes.func,
};

export default connect({
  'renderer.*': (args, { type }) => args[0] === type,
  'external.load': true
}, ({ systems }, { type }) => ({
  assets: systems.renderer[PLURAL[type]]
}))(RenderAssetList);
