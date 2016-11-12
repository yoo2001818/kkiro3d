import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';
import classNames from 'classnames';

import { DropTarget } from 'react-dnd';

import EntityNode from '../entityNode';
import createHierarchy from '../../util/entityNode';
import FilterList from '../../component/filterList';

const listTarget = {
  drop(props, monitor) {
    if (monitor.didDrop()) return monitor.getDropResult();
    return {
      id: null
    };
  }
};

class EntityList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: ''
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
  }
  handleChange(e) {
    this.setState({
      query: e.target.value
    });
  }
  handleSelect(entity) {
    if (this.props.onSelect) this.props.onSelect(entity);
  }
  handleDrag(id, targetId) {
    let { engine } = this.props;
    let { entities } = engine.state;
    let entity = entities[id];
    let target = entities[targetId];
    console.log(id, targetId);
    if (entity.parent === undefined) {
      if (target == null) {
        // Do nothing
      } else {
        // Add component
        engine.actions.entity.add.parent(entity, targetId);
      }
    } else {
      if (target == null) {
        // Remove component
        engine.actions.entity.remove.parent(entity);
      } else {
        // Add component
        engine.actions.parent.set(entity, targetId);
      }
    }
  }
  render() {
    const { query } = this.state;
    const { engine, selected, allowNull, connectDropTarget, over } =
      this.props;
    let hierarchy = createHierarchy(engine, entity => {
      if (query === '') return true;
      if (entity.name == null) return false;
      return entity.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
    return (
      <FilterList onChange={this.handleChange.bind(this)} query={query}>
        {connectDropTarget(
            <ul className={classNames('entity-list', { over })}>
            { allowNull && (
              <li onClick={this.handleSelect.bind(this, null)}
                className={classNames('entry', {
                  selected: selected === -1 || selected === null
                })}
              >
                (None)
              </li>
            )}
            { hierarchy.map((entity, key) => (
              <EntityNode
                selected={selected} onSelect={this.handleSelect}
                onDrag={this.handleDrag}
                entity={entity} key={key} searching={query !== ''} />
            ))}
          </ul>
        )}
      </FilterList>
    );
  }
}

EntityList.propTypes = {
  engine: PropTypes.object,
  selected: PropTypes.number,
  onSelect: PropTypes.func,
  allowNull: PropTypes.bool,
  connectDropTarget: PropTypes.func,
  over: PropTypes.bool
};

const DropEntityList = DropTarget('entityNode', listTarget,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    over: monitor.canDrop() && monitor.isOver({ shallow: true })
  })
)(EntityList);

export default connect({
  'entity.create!': true,
  'entity.delete!': true,
  'entity.add.parent!': true,
  'entity.remove.parent!': true,
  'external.load!': true,
  'editor.select!': true,
  'name.set!': true,
  'parent.set!': true
}, (engine) => ({
  engine
}))(DropEntityList);
