import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';
import classNames from 'classnames';

import FilterList from '../../component/filterList';

class EntityList extends Component {
  handleSelect(entity) {
    if (this.props.onSelect) this.props.onSelect(entity);
  }
  render() {
    const { entities, selected, allowNull } = this.props;
    let data = entities.map((entity) => ({
      name: entity.name,
      className: classNames({ selected: entity.id === selected }),
      onClick: this.handleSelect.bind(this, entity.id)
    }));
    if (allowNull) {
      data.unshift({
        name: '(None)',
        className: classNames({
          selected: selected === -1 || selected === null
        }),
        onClick: this.handleSelect.bind(this, null)
      });
    }
    return (
      <FilterList data={data} />
    );
  }
}

EntityList.propTypes = {
  entities: PropTypes.array,
  selected: PropTypes.number,
  onSelect: PropTypes.func,
  allowNull: PropTypes.bool
};

export default connect({
  'entity.create': true,
  'entity.delete': true,
  'external.load': true,
  'editor.select': true,
  'name.set': true
}, ({ state }) => ({
  entities: state.entities.filter(v => v != null)
}))(EntityList);
