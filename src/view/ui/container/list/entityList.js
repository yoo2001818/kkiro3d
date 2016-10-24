import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';
import classNames from 'classnames';

import FilterList from '../../component/filterList';

class EntityList extends Component {
  handleClick(entity) {
    this.props.execute('editor.selectEntity', entity);
  }
  render() {
    const { entities, selected } = this.props;
    return (
      <FilterList data={ entities.map((entity) => ({
        name: entity.name,
        className: classNames({ selected: entity.id === selected }),
        onClick: this.handleClick.bind(this, entity)
      }))} />
    );
  }
}

EntityList.propTypes = {
  entities: PropTypes.array,
  selected: PropTypes.number,
  execute: PropTypes.func
};

export default connect({
  'entity.create': true,
  'entity.delete': true,
  'external.load': true,
  'editor.selectEntity': true,
  'name.set': true
}, ({ state, actions }) => ({
  entities: state.entities,
  selected: state.global.selectedEntity,
  execute: actions.external.execute
}))(EntityList);
