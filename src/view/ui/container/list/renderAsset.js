import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';
import classNames from 'classnames';

import FilterList from '../../component/filterList';

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
  // TODO Use function to validate update?
  'renderer.*': true,
  'external.load': true
}, ({ systems }, { type }) => ({
  assets: systems.renderer[type]
}))(RenderAssetList);