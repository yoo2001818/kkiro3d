import React, { Component, PropTypes } from 'react';
import connectComponent from '../../util/connectComponent';

import { vec3 } from 'gl-matrix';
import { quatToEuler, eulerToQuat } from 'webglue/lib/util/euler';

import EntityComponentSection from '../../component/entityComponentSection';
import Field from '../../component/ui/field';
import VectorInput from '../../component/ui/vectorInput';


let tmpEuler = new Float32Array(3);
let tmpQuat = new Float32Array(4);

class EntityComponentTransform extends Component {
  handlePosition(e) {
    let newValue = e.target.value;
    const { entity, execute } = this.props;
    execute('transform.setPosition', entity, newValue);
  }
  handleRotation(e) {
    let newValue = e.target.value;
    const { entity, execute } = this.props;
    vec3.scale(newValue, newValue, Math.PI / 180);
    execute('transform.setRotation', entity, eulerToQuat(tmpQuat, newValue));
  }
  handleScale(e) {
    let newValue = e.target.value;
    const { entity, execute } = this.props;
    execute('transform.setScale', entity, newValue);
  }
  render() {
    const { entity, execute } = this.props;
    quatToEuler(tmpEuler, entity.transform.rotation);
    vec3.scale(tmpEuler, tmpEuler, 180 / Math.PI);
    return (
      <EntityComponentSection className='entity-component-transform'
        header='Transform'
        onRemove={() => execute('entity.remove.transform', entity)}
      >
        <Field label='Position'>
          <VectorInput value={entity.transform.position}
            onChange={this.handlePosition.bind(this)}
            precision={4}
            className='vertical'
          />
        </Field>
        <Field label='Rotation'>
          <VectorInput value={tmpEuler}
            onChange={this.handleRotation.bind(this)}
            precision={1}
            className='degree vertical'
          />
        </Field>
        <Field label='Scale'>
          <VectorInput value={entity.transform.scale}
            onChange={this.handleScale.bind(this)}
            precision={4}
            className='vertical'
          />
        </Field>
      </EntityComponentSection>
    );
  }
}

EntityComponentTransform.propTypes = {
  entity: PropTypes.object.isRequired,
  execute: PropTypes.func.isRequired
};

export default connectComponent(['transform.*'])(EntityComponentTransform);
