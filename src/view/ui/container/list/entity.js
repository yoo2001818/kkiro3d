import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';
import classNames from 'classnames';

import EntityNode, { createHierarchy } from '../../component/entityNode';
import FilterList from '../../component/filterList';

class EntityList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: ''
    };
    this.handleSelect = this.handleSelect.bind(this);
  }
  handleChange(e) {
    this.setState({
      query: e.target.value
    });
  }
  handleSelect(entity) {
    if (this.props.onSelect) this.props.onSelect(entity);
  }
  render() {
    const { query } = this.state;
    const { engine, selected, allowNull } =
      this.props;
    let hierarchy = createHierarchy(engine, entity => {
      if (query === '') return true;
      if (entity.name == null) return false;
      return entity.name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
    return (
      <FilterList onChange={this.handleChange.bind(this)} query={query}>
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
            entity={entity} key={key} searching={query !== ''} />
        ))}
      </FilterList>
    );
  }
}

EntityList.propTypes = {
  engine: PropTypes.object,
  selected: PropTypes.number,
  onSelect: PropTypes.func,
  allowNull: PropTypes.bool
};

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
}))(EntityList);
