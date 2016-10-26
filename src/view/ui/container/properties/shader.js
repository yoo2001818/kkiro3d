import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';

import Section from '../../component/section';
import Field from '../../component/ui/field';

import lookup from 'gl-constants/lookup';

// TODO Shader should have these in array form :(
function forEachShaders(shader, callback) {
  if (shader.useFeatures) {
    for (let key in shader.shaders) {
      if (shader.useCounts) {
        shader.shaders[key].forEach((v, i) => callback(
          Object.assign({features: key}, v), key + i));
      } else {
        callback({shader: shader.shaders[key], features: key}, key);
      }
    }
  } else {
    if (shader.useCounts) {
      shader.shaders.forEach((v, i) => callback(v, i));
    } else {
      if (shader.shaders != null) callback({shader: shader.shaders}, 0);
    }
  }
}

function countShaders(shader) {
  let count = 0;
  forEachShaders(shader, () => count ++);
  return count;
}

function mapShaders(shader, callback) {
  let result = [];
  forEachShaders(shader, (subShader, key) => {
    result.push(callback(subShader, key));
  });
  return result;
}

class ShaderProperties extends Component {
  render() {
    const { shader, selected } = this.props;
    if (shader == null) return false;
    console.log(shader.metadata);
    return (
      <div className='shader-properties properties'>
        <div className='properties-name-readonly'>
          { selected }
        </div>
        <Section header='PreprocessShader'>
          <Field label='Features?'>
            { shader.useFeatures ? 'Yes' : 'No' }
          </Field>
          <Field label='Counts?'>
            { shader.useCounts ? 'Yes' : 'No' }
          </Field>
          <Field label='Shaders'>
            { countShaders(shader) }
          </Field>
        </Section>
        { shader.metadata.features && (
          <Section header='Features'>
            { shader.metadata.features.map((feature, i) => (
              <Field label={feature.key} className='vertical' key={i}>
                { feature.vert && (
                  <ul className='properties-list-readonly'>
                    { feature.vert.map((define, i) => (
                      <li key={i}>{define}</li>
                    ))}
                  </ul>
                )}
                { feature.frag && (
                  <ul className='properties-list-readonly'>
                    { feature.frag.map((define, i) => (
                      <li key={i}>{define}</li>
                    ))}
                  </ul>
                )}
              </Field>
            ))}
          </Section>
        )}
        { shader.metadata.counts && (
          <Section header='Counts'>
          { shader.metadata.counts.map((count, i) => (
            <Field label={count.key} className='vertical' key={i}>
              { count.vert && (
                <ul className='properties-list-readonly'>
                  { count.vert.defines.map((define, i) => (
                    <li key={i}>{define}</li>
                  ))}
                </ul>
              )}
              { count.frag && (
                <ul className='properties-list-readonly'>
                  { count.frag.defines.map((define, i) => (
                    <li key={i}>{define}</li>
                  ))}
                </ul>
              )}
            </Field>
          ))}
          </Section>
        )}
        { mapShaders(shader, (subShader, i) => (
          <Section header='Subshader' key={i}>
            { subShader.uniforms && (
              <Field label='Counts' className='vertical'>
                <ul className='properties-list-readonly'>
                { Object.keys(subShader.uniforms).map(key => (
                  <li key={key}>
                    {key} <b>{subShader.uniforms[key]}</b>
                  </li>
                ))}
                </ul>
              </Field>
            )}
            { shader.useFeatures && (
              <Field label='Features' className='vertical'>
                <ul className='properties-list-readonly'>
                  { shader.metadata.features.map((feature, i) =>
                    ((subShader.features & (1 << (i-1))) !== 0) && (
                      <li key={i}>{feature.key}</li>
                    )
                  )}
                </ul>
              </Field>
            )}
            <Field label='Attributes' className='vertical'>
              <ul className='properties-list-readonly'>
                { Object.keys(subShader.shader.attributes).map(key => (
                  <li key={key}>
                    {key}
                  </li>
                ))}
              </ul>
            </Field>
            <Field label='Uniforms' className='vertical'>
              <ul className='properties-list-readonly'>
                { Object.keys(subShader.shader.uniforms).map(key =>
                  subShader.shader.uniforms[key].type && (
                    <li key={key}>
                      {key} <b>
                        {lookup(subShader.shader.uniforms[key].type)}
                      </b>
                    </li>
                  )
                )}
              </ul>
            </Field>
          </Section>
        ))}
      </div>
    );
  }
}

ShaderProperties.propTypes = {
  shader: PropTypes.object,
  selected: PropTypes.string
};

let checkUpdate = ([name], { selected }) => name === selected;

export default connect({
  'renderer.shader.*': checkUpdate
}, (engine, { selected }) => ({
  shader: engine.systems.renderer.shaders[selected],
  execute: engine.actions.external.execute
}))(ShaderProperties);
