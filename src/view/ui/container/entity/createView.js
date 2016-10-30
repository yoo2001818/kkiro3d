import React, { Component, PropTypes } from 'react';
import connectComponent from '../../util/connectComponent';
import getHandler from '../../util/getComponentHandler';

import * as inputTypes from '../input';
import EntityComponentSection from '../../component/entityComponentSection';
import Field from '../../component/ui/field';

import capitalize from '../../../../util/capitalize';

export default function createView(name, schema) {
  class ComponentView extends Component {
    render() {
      const { entity, execute, engine } = this.props;
      return (
        <EntityComponentSection className='entity-component-view'
          header={capitalize(name)}
          onRemove={() => execute(`entity.remove.${name}`, entity)}
        >
          {Object.keys(schema).map(key => {
            let entry = schema[key];
            if (entry.visible && !entry.visible(entity, engine)) return false;

            let value;
            if (entry.getValue) {
              value = entry.getValue(entity, engine);
            } else {
              value = entity[name][key];
            }

            let setter;
            if (entry.setValue) {
              setter = getHandler(this, entry.setValue);
            } else {
              setter = getHandler(this, (entity, value) =>
                [`${name}.set`, entity, {[key]: value}]);
            }

            let returned = inputTypes[entry.type](value, setter,
              Object.assign({ key: key }, entry));
            return (
              <Field label={capitalize(key)}>
                { returned }
              </Field>
            );
          })}
        </EntityComponentSection>
      );
    }
  }
  ComponentView.propTypes = {
    entity: PropTypes.object,
    execute: PropTypes.func,
    engine: PropTypes.object
  };
  ComponentView.displayName = `ComponentView<${name}>`;
  return connectComponent([`${name}.*`])(ComponentView);
}
