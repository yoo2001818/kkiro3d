import React, { Component, PropTypes } from 'react';

export default class FilterList extends Component {
  render() {
    const { query, children, onChange } = this.props;
    return (
      <div className='filter-list-component'>
        <div className='header'>
          <input type='text' value={query} placeholder='Search'
            onChange={onChange} />
        </div>
        <div className='content'>
          <ul>
            { children }
          </ul>
        </div>
      </div>
    );
  }
}

FilterList.propTypes = {
  children: PropTypes.node,
  query: PropTypes.string,
  onChange: PropTypes.func
};
