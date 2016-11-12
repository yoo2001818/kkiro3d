import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';

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
    const { entity, childrens, entities, orphan, selected, onSelect }
      = this.props;
    let entityData = entities[entity];
    if (entityData == null) return false;
    let children = childrens[entity];
    let hasChildren = children != null && children.length > 0;
    return (
      <li className={classNames('entity-node', {
        parent: hasChildren, open, orphan, selected: selected === entity
      })}>
        <div className='title'>
          <div className='handle' onClick={this.handleOpen.bind(this)}/>
          <div className='name' onClick={onSelect.bind(null, entity)}>
            {entityData.name || entityData.id}
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
              <EntityNode entities={entities} childrens={childrens}
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
  entity: PropTypes.number,
  childrens: PropTypes.array,
  entities: PropTypes.array,
  selected: PropTypes.bool,
  orphan: PropTypes.bool,
  onSelect: PropTypes.func
};
