import React, { Component, PropTypes } from 'react';
import connectComponent from '../../util/connectComponent';

import Section from '../../component/section';
import Field from '../../component/ui/field';
import Vec3Input from '../../component/ui/vec3Input';
import Vec4Input from '../../component/ui/vec4Input';

class EntityComponentTransform extends Component {
  handlePosition(e) {
    let newValue = e.target.value;
    const { entity, execute } = this.props;
    execute('transform.setPosition', entity, newValue);
  }
  handleRotation(e) {
    let newValue = e.target.value;
    const { entity, execute } = this.props;
    execute('transform.setRotation', entity, newValue);
  }
  handleScale(e) {
    let newValue = e.target.value;
    const { entity, execute } = this.props;
    execute('transform.setScale', entity, newValue);
  }
  render() {
    const { entity } = this.props;
    return (
      <Section className='entity-component-transform'
        header='Transform'
      >
        <Field label='Position'>
          <Vec3Input value={entity.transform.position}
            onChange={this.handlePosition.bind(this)}
          />
        </Field>
        <Field label='Rotation'>
          <Vec4Input value={entity.transform.rotation}
            onChange={this.handleRotation.bind(this)}
          />
        </Field>
        <Field label='Scale'>
          <Vec3Input value={entity.transform.scale}
            onChange={this.handleScale.bind(this)}
          />
        </Field>
      </Section>
    );
  }
}

EntityComponentTransform.propTypes = {
  entity: PropTypes.object.isRequired,
  execute: PropTypes.func.isRequired
};

export default connectComponent(['transform.*'])(EntityComponentTransform);
