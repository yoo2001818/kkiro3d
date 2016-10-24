import React, { Component, PropTypes } from 'react';

export default class FilterList extends Component {
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
  render() {
    const { query } = this.state;
    const { data } = this.props;
    return (
      <div className='filter-list-component'>
        <div className='header'>
          <input type='text' value={query} placeholder='Search'
            onChange={this.handleChange.bind(this)} />
        </div>
        <div className='content'>
          <ul>
            {data.filter(e =>
              e.name.toLowerCase().indexOf(query.toLowerCase()) !== -1)
            .map((entry, i) => (
              <li key={i} onClick={entry.onClick} className={entry.className}>
                {entry.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}

FilterList.propTypes = {
  data: PropTypes.array
};
