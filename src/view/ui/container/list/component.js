import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';
import classNames from 'classnames';
import capitalize from '../../../../util/capitalize'

import FilterList from '../../component/filterList';

class ComponentList extends Component {
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
  handleSelect(component) {
    if (this.props.onSelect) this.props.onSelect(component);
  }
  render() {
    const { query } = this.state;
    const { components, selected, filter = () => true } = this.props;
    return (
      <FilterList onChange={this.handleChange.bind(this)} query={query}>
        {components.filter(c =>
          c.toLowerCase().indexOf(query.toLowerCase()) !== -1)
        .filter(filter)
        .map((component, i) => (
          <li key={i}
            onClick={this.handleSelect.bind(this, component)}
            className={classNames({ selected: component === selected })}
          >
            {capitalize(component)}
          </li>
        ))}
      </FilterList>
    );
  }
}

ComponentList.propTypes = {
  components: PropTypes.array,
  selected: PropTypes.string,
  filter: PropTypes.func,
  onSelect: PropTypes.func,
};

export default connect({
  'external.start': true
}, (engine) => ({
  components: engine.components.list,
}))(ComponentList);
