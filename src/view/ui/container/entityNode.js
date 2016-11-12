import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';

import { DragSource, DropTarget } from 'react-dnd';

function unFoldChildren(entity, output = []) {
  output.push(entity.id);
  if (entity.entities != null) {
    entity.entities.forEach(entity => unFoldChildren(entity));
  }
  return output;
}

const nodeSource = {
  beginDrag(props) {
    return {
      id: props.entity.id,
      children: unFoldChildren(props.entity)
    };
  },
  endDrag(props, monitor) {
    if (!monitor.didDrop()) return;
    let result = monitor.getDropResult();
    console.log(result);
    props.onDrag(props.entity.id, result.id);
  }
};

const nodeTarget = {
  drop(props) {
    return {
      id: props.entity.id
    };
  },
  canDrop(props, monitor) {
    let item = monitor.getItem();
    return item.children.indexOf(props.entity.id) === -1;
  }
};

class EntityNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true
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
    const { entity, selected, onSelect, searching, onDrag, connectDragSource,
      connectDropTarget, dragging, over, canDrop } = this.props;
    let orphan = entity.orphan;
    let children = entity.children;
    let hasChildren = children != null && children.length > 0;
    return (
      <li className={classNames('entity-node', {
        parent: hasChildren, open, orphan, dragging,
        matched: searching && entity.matched,
        selected: canDrop ? over : selected === entity.id
      })}>
        <div className='title'>
          <div className='handle' onClick={this.handleOpen.bind(this)}/>
          {connectDropTarget(connectDragSource(
            <div className='name' onClick={onSelect.bind(null, entity.id)}>
              {entity.name}
              {orphan && (
                <span className='orphan'>
                  (Orphan)
                </span>
              )}
            </div>
          ))}
        </div>
        { open && hasChildren && (
          <ul className='children'>
            {children.map((child, key) => (
              <DropEntityNode
                selected={selected} onSelect={onSelect}
                onDrag={onDrag}
                entity={child} key={key} searching={searching} />
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
  onSelect: PropTypes.func,
  searching: PropTypes.bool,
  onDrag: PropTypes.func,
  connectDragSource: PropTypes.func,
  connectDropTarget: PropTypes.func,
  dragging: PropTypes.bool,
  canDrop: PropTypes.bool,
  over: PropTypes.bool
};

const DragEntityNode = DragSource('entityNode', nodeSource,
  (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    dragging: monitor.isDragging()
  })
)(EntityNode);

const DropEntityNode = DropTarget('entityNode', nodeTarget,
  (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    over: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop()
  })
)(DragEntityNode);

export default DropEntityNode;
