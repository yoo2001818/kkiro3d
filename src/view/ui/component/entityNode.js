import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';

export function createEntityNode(engine, filter, entity) {
  // Create entity hierarchy
  let { childrens } = engine.systems.parent;
  let children = childrens[entity.id];
  let entities = engine.state.entities;
  if (children == null || children.length === 0) {
    if (filter && !filter(entity)) return null;
    return {
      id: entity.id,
      name: entity.name
    };
  }
  let nodes = [];
  for (let i = 0; i < children.length; ++i) {
    let child = entities[children[i]];
    if (child == null) continue;
    let childNode = createEntityNode(engine, filter, child);
    if (childNode == null) continue;
    nodes.push(childNode);
  }
  if (nodes.length === 0) return null;
  return {
    id: entity.id,
    name: entity.name,
    children: nodes
  };
}

export function createHierarchy(engine, filter) {
  let { root, orphans } = engine.systems.parent;
  let entities = engine.state.entities;
  let nodes = [];
  for (let i = 0; i < root.length; ++i) {
    let child = entities[root[i]];
    if (child == null) continue;
    let childNode = createEntityNode(engine, filter, child);
    if (childNode == null) continue;
    nodes.push(childNode);
  }
  for (let i = 0; i < orphans.length; ++i) {
    let child = entities[orphans[i]];
    if (child == null) continue;
    let childNode = createEntityNode(engine, filter, child);
    if (childNode == null) continue;
    childNode.orphan = true;
    nodes.push(childNode);
  }
  return nodes;
}

export default class EntityNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }
  handleOpen() {
    const { open } = this.state;
    this.setState({
      open: !open
    });
  }
  render() {
    const { open } = this.state;
    const { entity, selected, onSelect }
      = this.props;
    let orphan = entity.orphan;
    let children = entity.children;
    let hasChildren = children != null && children.length > 0;
    return (
      <li className={classNames('entity-node', {
        parent: hasChildren, open, orphan, selected: selected === entity.id
      })}>
        <div className='title'>
          <div className='handle' onClick={this.handleOpen.bind(this)}/>
          <div className='name' onClick={onSelect.bind(null, entity.id)}>
            {entity.name}
            {orphan && (
              <span className='orphan'>
                (Orphan)
              </span>
            )}
          </div>
        </div>
        { open && hasChildren && (
          <ul className='children'>
            {children.map((child, key) => (
              <EntityNode
                selected={selected} onSelect={onSelect}
                entity={child} key={key} />
            ))}
          </ul>
        )}
      </li>
    );
  }
}

EntityNode.propTypes = {
  entity: PropTypes.object,
  selected: PropTypes.number,
  onSelect: PropTypes.func
};
