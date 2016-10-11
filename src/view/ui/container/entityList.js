import React, { Component, PropTypes } from 'react';
import connect from '../util/connectFudge';

class EntityList extends Component {
  render() {
    return (
      <ul className='entity-list'>
        { this.props.entities.map((entity, id) => entity && (
          <li key={id}>
            {JSON.stringify(entity)}
          </li>
        ))}
      </ul>
    );
  }
}

EntityList.propTypes = {
  entities: PropTypes.array
};

export default connect({
  'entity.create': true,
  'entity.delete': true,
  'external.load': true,
  'editor.select': true
}, ({ state }) => ({ entities: state.entities }))(EntityList);
