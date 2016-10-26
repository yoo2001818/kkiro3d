import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';

import Section from '../../component/section';
import Field from '../../component/ui/field';

import lookup from 'gl-constants/lookup';

function mapArrayOrObject(data, callback) {
  if (Array.isArray(data)) return data.map(callback);
  return callback(data, 0);
}

class TextureProperties extends Component {
  render() {
    const { texture, selected } = this.props;
    if (texture == null) return false;
    const options = texture.options;
    const params = options.params;
    return (
      <div className='texture-properties properties'>
        <div className='properties-name-readonly'>
          { selected }
        </div>
        <Section header='Current'>
          <Field label='Loaded?'>{ texture.loaded ? 'Yes' : 'No' }</Field>
          <Field label='Width'>{ texture.width }</Field>
          <Field label='Height'>{ texture.height }</Field>
        </Section>
        <Section header='Source' className='source-section'>
          { mapArrayOrObject(options.source, (image, i) => image != null && (
            <a href={image.src} target='_blank' key={i}>
              <img src={image.src} />
            </a>
          ))}
        </Section>
        <Section header='Options'>
          <Field label='Type'>
            { Array.isArray(options.source) ? 'Cubemap' : '2D' }
          </Field>
          <Field label='Format'>
            { lookup(options.format) }
          </Field>
          <Field label='Type'>
            { lookup(options.type) }
          </Field>
        </Section>
        <Section header='Params'>
          <Field label='Flip Y'>
            { params.flipY ? 'Yes' : 'No' }
          </Field>
          <Field label='Mipmap'>
            { params.mipmap ? 'Yes' : 'No' }
          </Field>
          <Field label='Mag Filter'>
            { lookup(params.magFilter) }
          </Field>
          <Field label='Min Filter'>
            { lookup(params.minFilter) }
          </Field>
          <Field label='Wrap S'>
            { lookup(params.wrapS) }
          </Field>
          <Field label='Wrap T'>
            { lookup(params.wrapT) }
          </Field>
        </Section>
      </div>
    );
  }
}

TextureProperties.propTypes = {
  texture: PropTypes.object,
  selected: PropTypes.string
};

let checkUpdate = ([name], { selected }) => name === selected;

export default connect({
  'renderer.texture.*': checkUpdate
}, (engine, { selected }) => ({
  texture: engine.systems.renderer.textures[selected],
  execute: engine.actions.external.execute
}))(TextureProperties);
