import React, { Component, PropTypes } from 'react';
import connectComponent from '../../util/connectComponent';
import getHandler from '../../util/getComponentHandler';

import EntityComponentSection from '../../component/entityComponentSection';
import Field from '../../component/ui/field';
import SelectInput from '../../component/ui/selectInput';
import VectorInput from '../../component/ui/vectorInput';
import NumberInput from '../../component/ui/numberInput';

class EntityComponentCamera extends Component {
  render() {
    const { entity, execute } = this.props;
    return (
      <EntityComponentSection className='entity-component-camera'
        header='Camera'
        onRemove={() => execute('entity.remove.camera', entity)}
      >
        <Field label='Type'>
          <SelectInput
            value={entity.camera.type}
            onChange={getHandler(this, (entity, value) =>
              ['camera.set', entity, {type: value}])}
            options={[
              {value: 'persp', label: 'Perspective'},
              {value: 'ortho', label: 'Orthogonal'},
            ]}
            className='list'
          />
        </Field>
        <Field label='Range'>
          <VectorInput
            value={[entity.camera.near, entity.camera.far]}
            onChange={getHandler(this, (entity, value) =>
              ['camera.set', entity, {near: value[0], far: value[1]}])}
          />
        </Field>
        { entity.camera.type === 'persp' && (
          <Field label='FOV'>
            <NumberInput
              value={entity.camera.fov / Math.PI * 180}
              onChange={getHandler(this, (entity, value) =>
                ['camera.set', entity,
                  {fov: parseFloat(value) / 180 * Math.PI}
                ])}
              className='degree'
              precision={2}
            />
          </Field>
        )}
        { entity.camera.type === 'ortho' && (
          <Field label='Zoom'>
            <NumberInput
              value={entity.camera.zoom}
              onChange={getHandler(this, (entity, value) =>
                ['camera.set', entity, {zoom: parseFloat(value)}])}
            />
          </Field>
        )}
      </EntityComponentSection>
    );
  }
}

EntityComponentCamera.propTypes = {
  entity: PropTypes.object.isRequired,
  execute: PropTypes.func.isRequired
};

export default connectComponent(['camera.*'])(
  EntityComponentCamera);
