import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';
import classNames from 'classnames';

import FilterList from '../../component/filterList';

class EntityList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: ''
    };
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
    const { entities, selected, allowNull } = this.props;
    return (
      <FilterList onChange={this.handleChange.bind(this)} query={query}>
        { allowNull && (
          <li onClick={this.handleSelect.bind(this, null)}
            className={classNames({
              selected: selected === -1 || selected === null
            })}
          >
            (None)
          </li>
        )}
        { entities.filter(entity => {
          let name = entity.name || '';
          return name.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        }).map((entity, i) => (
          <li key={i}
            onClick={this.handleSelect.bind(this, entity.id)}
            className={classNames({ selected: entity.id === selected })}
          >
            {entity.name}
          </li>
        )) }
      </FilterList>
    );
  }
}

EntityList.propTypes = {
  entities: PropTypes.array,
  selected: PropTypes.number,
  onSelect: PropTypes.func,
  allowNull: PropTypes.bool
};

export default connect({
  'entity.create': true,
  'entity.delete': true,
  'external.load': true,
  'editor.select': true,
  'name.set': true
}, ({ state }) => ({
  entities: state.entities.filter(v => v != null)
}))(EntityList);
