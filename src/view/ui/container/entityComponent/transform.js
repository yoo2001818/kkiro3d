import React, { Component, PropTypes } from 'react';
import connectComponent from '../../util/connectComponent';

import { vec3 } from 'gl-matrix';
import { quatToEuler, eulerToQuat } from 'webglue/lib/util/euler';

import EntityComponentSection from '../../component/entityComponentSection';
import Field from '../../component/ui/field';
import VectorInput from '../../component/ui/vectorInput';

class TransformSection extends Component {
  constructor(props) {
    super(props);
    this.tmpEuler = new Float32Array(3);
    this.tmpQuat = new Float32Array(4);
  }
  handleRotation(e) {
    let newValue = e.target.value;
    vec3.scale(newValue, newValue, Math.PI / 180);
    this.props.onRotation({
      target: {
        value: eulerToQuat(this.tmpQuat, newValue)
      }
    });
  }
  render() {
    const { label, position, rotation, scale } = this.props;
    quatToEuler(this.tmpEuler, rotation);
    vec3.scale(this.tmpEuler, this.tmpEuler, 180 / Math.PI);
    return (
      <Field className='vertical transform-field' label={label}>
        <Field label='Position'>
          <VectorInput value={position}
            onChange={this.props.onPosition}
            precision={4}
            className='vertical'
          />
        </Field>
        <Field label='Rotation'>
          <VectorInput value={this.tmpEuler}
            onChange={this.handleRotation.bind(this)}
            precision={1}
            className='degree vertical'
          />
        </Field>
        <Field label='Scale'>
          <VectorInput value={scale}
            onChange={this.props.onScale}
            precision={4}
            className='vertical'
          />
        </Field>
      </Field>
    );
  }
}

TransformSection.propTypes = {
  label: PropTypes.string,
  position: PropTypes.any,
  rotation: PropTypes.any,
  scale: PropTypes.any,
  onPosition: PropTypes.func,
  onRotation: PropTypes.func,
  onScale: PropTypes.func
};

class EntityComponentTransform extends Component {
  constructor(props) {
    super(props);
    this.tmpScale = new Float32Array(3);
    this.tmpRotation = new Float32Array(4);
  }
  handlePosition(isGlobal, e) {
    let newValue = e.target.value;
    const { entity, execute } = this.props;
    execute('transform.setPosition', entity, newValue, isGlobal);
  }
  handleRotation(isGlobal, e) {
    let newValue = e.target.value;
    const { entity, execute } = this.props;
    execute('transform.setRotation', entity, newValue, isGlobal);
  }
  handleScale(isGlobal, e) {
    let newValue = e.target.value;
    const { entity, execute } = this.props;
    execute('transform.setScale', entity, newValue, isGlobal);
  }
  render() {
    const { entity, engine, execute } = this.props;
    if (entity == null) return false;
    return (
      <EntityComponentSection className='entity-component-transform'
        header='Transform'
        onRemove={() => execute('entity.remove.transform', entity)}
      >
        <TransformSection label='Transform'
          position={engine.systems.matrix.getPosition(entity)}
          rotation={engine.systems.matrix.getRotation(this.tmpRotation, entity)}
          scale={engine.systems.matrix.getScale(this.tmpScale, entity)}
          onPosition={this.handlePosition.bind(this, true)}
          onRotation={this.handleRotation.bind(this, true)}
          onScale={this.handleScale.bind(this, true)}
        />
        <TransformSection label='Local Transform'
          position={entity.transform.position}
          rotation={entity.transform.rotation}
          scale={entity.transform.scale}
          onPosition={this.handlePosition.bind(this, false)}
          onRotation={this.handleRotation.bind(this, false)}
          onScale={this.handleScale.bind(this, false)}
        />
      </EntityComponentSection>
    );
  }
}

EntityComponentTransform.propTypes = {
  entity: PropTypes.object.isRequired,
  execute: PropTypes.func.isRequired,
  engine: PropTypes.object.isRequired
};

export default connectComponent(['transform.*', 'parent.*'],
  ([entity], { entity: propEntity }, engine) =>
    engine.systems.parent.isConnected(entity, propEntity)
)(EntityComponentTransform);
