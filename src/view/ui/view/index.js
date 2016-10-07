import React, { Component, PropTypes } from 'react';
import connect from '../util/connectFudge';

class Index extends Component {
  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <pre>
          {JSON.stringify(this.props.entities, undefined, 2)}
        </pre>
      </div>
    );
  }
}

Index.propTypes = {
  entities: PropTypes.array
};

export default connect({
  'entity.*': true, 
  'transform.*': true
}, ({ state }) => ({ entities: state.entities }))(Index);
