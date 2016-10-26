import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';

import Section from '../../component/section';
import Field from '../../component/ui/field';

import lookup from 'gl-constants/lookup';

function mapArrayOrObject(data, callback) {
  if (Array.isArray(data)) return data.map(callback);
  return callback(data, 0);
}

class GeometryProperties extends Component {
  render() {
    const { geometry, selected } = this.props;
    if (geometry == null) return false;
    return (
      <div className='geometry-properties properties'>
        <div className='properties-name-readonly'>
          { selected }
        </div>
        { mapArrayOrObject(geometry, (geometry, i) => (
          <Section header='Geometry' key={i}>
            <Field label='Loaded?'>{ geometry.vbo ? 'Yes' : 'No' }</Field>
            <Field label='Count'>{ geometry.count }</Field>
            <Field label='PrimCount'>{ geometry.primCount }</Field>
            <Field label='Mode'>{ lookup(geometry.mode) }</Field>
            <Field label='Usage'>{ lookup(geometry.usage) }</Field>
            <Field label='Attributes'>
              <ul className='properties-list-readonly'>
                { (geometry.attributeList || []).map(v => (
                  <li>{v.name}</li>
                )) }
              </ul>
            </Field>
          </Section>
        ))}
      </div>
    );
  }
}

GeometryProperties.propTypes = {
  geometry: PropTypes.object,
  selected: PropTypes.string
};

let checkUpdate = ([name], { selected }) => name === selected;

export default connect({
  'renderer.geometry.*': checkUpdate
}, (engine, { selected }) => ({
  geometry: engine.systems.renderer.geometries[selected],
  execute: engine.actions.external.execute
}))(GeometryProperties);
