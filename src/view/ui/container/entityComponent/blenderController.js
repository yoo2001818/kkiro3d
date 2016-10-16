import React, { Component, PropTypes } from 'react';
import connectComponent from '../../util/connectComponent';
import getHandler from '../../util/getComponentHandler';

import Section from '../../component/section';
import Field from '../../component/ui/field';
import VectorInput from '../../component/ui/vectorInput';
import NumberInput from '../../component/ui/numberInput';

class EntityComponentBlenderController extends Component {
  render() {
    const { entity } = this.props;
    return (
      <Section className='entity-component-blender-controller'
        header='BlenderController'
      >
        <Field label='Center'>
          <VectorInput value={entity.blenderController.center}
            onChange={getHandler(this, (entity, value) =>
              ['blenderController.setCenter', entity, value])}
          />
        </Field>
        <Field label='Radius'>
          <NumberInput value={entity.blenderController.radius}
            onChange={getHandler(this, (entity, value) =>
              ['blenderController.setRadius', entity, parseFloat(value)])}
          />
        </Field>
      </Section>
    );
  }
}

EntityComponentBlenderController.propTypes = {
  entity: PropTypes.object.isRequired,
  execute: PropTypes.func.isRequired
};

export default connectComponent(['blenderController.*'])(
  EntityComponentBlenderController);
