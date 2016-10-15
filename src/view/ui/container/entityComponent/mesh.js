import React, { Component, PropTypes } from 'react';
import connectComponent from '../../util/connectComponent';

import Section from '../../component/section';
import Field from '../../component/ui/field';
import CachedTextInput from '../../component/ui/cachedTextInput';

function getHandler(thisObj, method) {
  return (e) => {
    let newValue = e.target.value;
    const { entity, execute } = thisObj.props;
    execute(method, entity, newValue);
  };
}

class EntityComponentMesh extends Component {
  render() {
    const { entity } = this.props;
    return (
      <Section className='entity-component-mesh'
        header='Mesh'
      >
        <Field label='Geometry'>
          <CachedTextInput value={entity.mesh.geometry}
            onChange={getHandler(this, 'mesh.setGeometry')}
          />
        </Field>
        <Field label='Material'>
          <CachedTextInput value={entity.mesh.material}
            onChange={getHandler(this, 'mesh.setMaterial')}
          />
        </Field>
      </Section>
    );
  }
}

EntityComponentMesh.propTypes = {
  entity: PropTypes.object.isRequired,
  execute: PropTypes.func.isRequired
};

export default connectComponent(['mesh.*'])(EntityComponentMesh);
