import React, { Component, PropTypes } from 'react';
import connectComponent from '../../util/connectComponent';
import getHandler from '../../util/getComponentHandler';

import EntityComponentSection from '../../component/entityComponentSection';
import Field from '../../component/ui/field';
import CachedTextInput from '../../component/ui/cachedTextInput';
import CheckboxInput from '../../component/ui/checkboxInput';

class EntityComponentMesh extends Component {
  render() {
    const { entity, execute } = this.props;
    return (
      <EntityComponentSection className='entity-component-mesh'
        header='Mesh'
        onRemove={() => execute('entity.remove.mesh', entity)}
      >
        <Field label='Geometry'>
          <CachedTextInput value={entity.mesh.geometry}
            onChange={getHandler(this,
              (entity, value) => ['mesh.setGeometry', entity, value])}
          />
        </Field>
        <Field label='Material'>
          <CachedTextInput value={entity.mesh.material}
            onChange={getHandler(this,
              (entity, value) => ['mesh.setMaterial', entity, value])}
          />
        </Field>
        <Field label='Visible'>
          <CheckboxInput value={entity.mesh.visible}
            onChange={getHandler(this,
              (entity, value) => ['mesh.setVisible', entity, value])}
          />
        </Field>
      </EntityComponentSection>
    );
  }
}

EntityComponentMesh.propTypes = {
  entity: PropTypes.object.isRequired,
  execute: PropTypes.func.isRequired
};

export default connectComponent(['mesh.*'])(EntityComponentMesh);
