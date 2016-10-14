import React, { Component, PropTypes } from 'react';
import connectComponent from '../../util/connectComponent';

import EntityComponent from '../../component/entityComponent';

class EntityComponentTransform extends Component {
  handleChange(e) {
    let newValue = e.target.value;
    const { entity, execute } = this.props;
    execute('name.set', entity, newValue);
  }
  render() {
    const { entity } = this.props;
    return (
      <EntityComponent className='entity-component-transform'
        header='Transform'
      >
        <div className='column position'>
          <div className='title'>
            Position
          </div>
          <div className='value'>{entity.transform.position[0].toFixed(5)}</div>
          <div className='value'>{entity.transform.position[1].toFixed(5)}</div>
          <div className='value'>{entity.transform.position[2].toFixed(5)}</div>
        </div>
        <div className='column rotation'>
          <div className='title'>
            Rotation
          </div>
          <div className='value'>{entity.transform.rotation[0].toFixed(5)}</div>
          <div className='value'>{entity.transform.rotation[1].toFixed(5)}</div>
          <div className='value'>{entity.transform.rotation[2].toFixed(5)}</div>
          <div className='value'>{entity.transform.rotation[3].toFixed(5)}</div>
        </div>
        <div className='column scale'>
          <div className='title'>
            Scale
          </div>
          <div className='value'>{entity.transform.scale[0].toFixed(5)}</div>
          <div className='value'>{entity.transform.scale[1].toFixed(5)}</div>
          <div className='value'>{entity.transform.scale[2].toFixed(5)}</div>
        </div>
      </EntityComponent>
    );
  }
}

EntityComponentTransform.propTypes = {
  entity: PropTypes.object.isRequired,
  execute: PropTypes.func.isRequired
};

export default connectComponent(['transform.*'])(EntityComponentTransform);
