import React, { Component, PropTypes } from 'react';
import connect from '../util/connect';

import EntityTag from '../component/entityTag';

class EntityList extends Component {
  handleClick(entity) {
    this.props.execute('editor.selectEntity', entity);
  }
  render() {
    const { entities, selected } = this.props;
    return (
      <ul className='entity-list'>
        { entities.map((entity, id) => entity && (
          <li key={id}>
            <EntityTag entity={entity}
              selected={entity.id === selected}
              onClick={this.handleClick.bind(this, entity)}
            />
          </li>
        ))}
      </ul>
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
