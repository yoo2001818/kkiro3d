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
  constructor(props) {
    super(props);
    this.state = {
      query: ''
    };
  }
  handleChange(e) {
    this.setState({
      query: e.target.value
    });
  }
  handleSelect(asset) {
    if (this.props.onSelect) this.props.onSelect(asset);
  }
  render() {
    const { query } = this.state;
    const { assets, selected } = this.props;
    return (
      <FilterList onChange={this.handleChange.bind(this)} query={query}>
        {Object.keys(assets).filter(asset =>
          asset.toLowerCase().indexOf(query.toLowerCase()) !== -1)
        .map((asset, i) => (
          <li key={i}
            onClick={this.handleSelect.bind(this, asset)}
            className={classNames('entry', { selected: asset === selected })}
          >
            {asset}
          </li>
        ))}
      </FilterList>
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
  'renderer.*!': (args, { type }) => args[0] === type,
  'external.load!': true
}, ({ systems }, { type }) => ({
  assets: systems.renderer[PLURAL[type]]
}))(RenderAssetList);
