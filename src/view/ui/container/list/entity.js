import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';
import classNames from 'classnames';

import { DropTarget } from 'react-dnd';
import { List } from 'react-virtualized';

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

class EntityListList extends Component {
  constructor(props) {
    super(props);
    this.onResize = this.setViewport.bind(this);
    this.state = {
      width: 10,
      height: 10
    };
  }
  componentDidMount() {
    window.addEventListener('resize', this.onResize);
    // Delay until next animation frame
    requestAnimationFrame(() => this.setViewport());
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }
  setViewport() {
    let bounds = this.node.getBoundingClientRect();
    this.setState({
      width: bounds.width,
      height: bounds.height
    });
  }
  render() {
    const { width = 10, height = 10} = this.state;
    const { selected, over, hierarchy, renderRow, connectDropTarget } =
      this.props;
    return connectDropTarget(
      <ul className={classNames('entity-list', { over })}
        ref={node => this.node = node}
      >
        <List width={width} height={height}
        rowCount={hierarchy.length} rowHeight={30} rowRenderer={renderRow}
        selected={selected} hierarchy={hierarchy}
        />
      </ul>
    );
  }
}
EntityListList.propTypes = {
  selected: PropTypes.number,
  over: PropTypes.bool,
  hierarchy: PropTypes.array,
  renderRow: PropTypes.func,
  connectDropTarget: PropTypes.func
};

class EntityList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: ''
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.renderRow = this.renderRow.bind(this);
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
  componentWillMount() {
    const { query } = this.state;
    const { engine } = this.props;
    this.hierarchy = createHierarchy(engine, entity => {
      if (query === '') return true;
      if (entity.name == null) return false;
      return entity.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
  }
  componentWillUpdate(nextProps, nextState) {
    const { query } = nextState;
    const { engine } = nextProps;
    this.hierarchy = createHierarchy(engine, entity => {
      if (query === '') return true;
      if (entity.name == null) return false;
      return entity.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
  }
  renderRow({ key, index, style }) {
    const { query } = this.state;
    const { selected } = this.props;
    let { hierarchy } = this;
    return (
      <EntityNode
        selected={selected} onSelect={this.handleSelect}
        onDrag={this.handleDrag}
        entity={hierarchy[index]} key={key} searching={query !== ''}
        style={style}
      />
    );
  }
  render() {
    const { query } = this.state;
    const { selected, allowNull, connectDropTarget, over } =
      this.props;
    let { hierarchy } = this;
    if (allowNull) {
      hierarchy.unshift({
        id: null,
        name: '(None)',
        level: 0
      });
    }
    return (
      <FilterList onChange={this.handleChange.bind(this)} query={query}>
        <EntityListList selected={selected} over={over} hierarchy={hierarchy}
          renderRow={this.renderRow} connectDropTarget={connectDropTarget} />
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
