import React, { Component, PropTypes } from 'react';
import connectComponent from '../../util/connectComponent';
import getHandler from '../../util/getComponentHandler';

import EntityComponentSection from '../../component/entityComponentSection';
import Field from '../../component/ui/field';

import EntityInput from '../ui/entityInput';
import EntityList from '../list/entity';

class EntityComponentParent extends Component {
  render() {
    const { entity, execute } = this.props;
    return (
      <EntityComponentSection className='entity-component-parent'
        header='Parent'
        onRemove={() => execute('entity.remove.parent', entity)}
      >
        <Field label='Parent'>
          <EntityInput value={entity.parent}
            onChange={getHandler(this,
              (entity, value) => ['parent.set', entity, value])}
          >
            <EntityList />
          </EntityInput>
        </Field>
      </EntityComponentSection>
    );
  }
}

EntityComponentParent.propTypes = {
  entity: PropTypes.object.isRequired,
  execute: PropTypes.func.isRequired
};

export default connectComponent(['parent.*'])(EntityComponentParent);
