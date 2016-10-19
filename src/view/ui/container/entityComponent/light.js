import React, { Component, PropTypes } from 'react';
import connectComponent from '../../util/connectComponent';
import getHandler from '../../util/getComponentHandler';

import EntityComponentSection from '../../component/entityComponentSection';
import Field from '../../component/ui/field';
import SelectInput from '../../component/ui/selectInput';
import NumberInput from '../../component/ui/numberInput';

class EntityComponentLight extends Component {
  render() {
    const { entity, execute } = this.props;
    return (
      <EntityComponentSection className='entity-component-light'
        header='Light'
        onRemove={() => execute('entity.remove.light', entity)}
      >
        <Field label='Type'>
          <SelectInput
            value={entity.light.type}
            onChange={getHandler(this, (entity, value) =>
              ['light.set', entity, {type: value}])}
            options={[
              {value: 'point', label: 'Point'},
              {value: 'directional', label: 'Directional'},
            ]}
            className='list'
          />
        </Field>
        <Field label='Color'>
          <input
            type='color'
            value={entity.light.color}
            onChange={getHandler(this, (entity, value) =>
              ['light.set', entity, {color: value}])}
          />
        </Field>
        <Field label='Ambient'>
          <NumberInput
            value={entity.light.ambient}
            onChange={getHandler(this, (entity, value) =>
              ['light.set', entity, {ambient: parseFloat(value)}])}
            precision={5}
          />
        </Field>
        <Field label='Diffuse'>
          <NumberInput
            value={entity.light.diffuse}
            onChange={getHandler(this, (entity, value) =>
              ['light.set', entity, {diffuse: parseFloat(value)}])}
            precision={5}
          />
        </Field>
        <Field label='Specular'>
          <NumberInput
            value={entity.light.specular}
            onChange={getHandler(this, (entity, value) =>
              ['light.set', entity, {specular: parseFloat(value)}])}
            precision={5}
          />
        </Field>
        { entity.light.type !== 'directional' && (
          <Field label='Attenuation'>
            <NumberInput
              value={entity.light.attenuation}
              onChange={getHandler(this, (entity, value) =>
                ['light.set', entity, {attenuation: parseFloat(value)}])}
              precision={5}
            />
          </Field>
        )}
      </EntityComponentSection>
    );
  }
}

EntityComponentLight.propTypes = {
  entity: PropTypes.object.isRequired,
  execute: PropTypes.func.isRequired
};

export default connectComponent(['light.*'])(
  EntityComponentLight);
