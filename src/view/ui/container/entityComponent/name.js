import React, { Component, PropTypes } from 'react';
import connectComponent from '../../util/connectComponent';

class EntityComponentName extends Component {
  handleChange(e) {
    let newValue = e.target.value;
    const { entity, execute } = this.props;
    execute('name.set', entity, newValue);
  }
  render() {
    const { entity } = this.props;
    return (
      <div className='entity-component entity-component-name'>
        <input type='text' value={entity.name}
          onChange={this.handleChange.bind(this)}
        />
      </div>
    );
  }
}

EntityComponentName.propTypes = {
  entity: PropTypes.object.isRequired,
  execute: PropTypes.func.isRequired
};

export default connectComponent(['name.set'])(EntityComponentName);
