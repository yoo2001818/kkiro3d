import React, { PropTypes, PureComponent } from 'react';
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

class EntityNode extends PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    const { entity, selected, onSelect, onOpen, searching, connectDragSource,
      connectDropTarget, dragging, over, canDrop, style } = this.props;
    let { orphan, parent, level, open } = entity;
    return (
      <li className={classNames('entity-node', {
        open, parent, orphan, dragging,
        matched: searching && entity.matched,
        selected: canDrop ? over : selected === entity.id
      })} style={Object.assign(style, {
        paddingLeft: level + 'em'
      })}>
        <div className='title'>
          <div className='handle'
            onClick={onOpen.bind(null, entity.id, !open)} />
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
      </li>
    );
  }
}

EntityNode.propTypes = {
  entity: PropTypes.object,
  selected: PropTypes.number,
  onSelect: PropTypes.func,
  onOpen: PropTypes.func,
  searching: PropTypes.bool,
  onDrag: PropTypes.func,
  connectDragSource: PropTypes.func,
  connectDropTarget: PropTypes.func,
  dragging: PropTypes.bool,
  canDrop: PropTypes.bool,
  over: PropTypes.bool,
  style: PropTypes.object
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
