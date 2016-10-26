import React, { Component, PropTypes } from 'react';
import connect from '../../util/connect';

import MaterialActions from '../materialActions';

import Section from '../../component/section';
import CachedTextArea from '../../component/ui/cachedTextArea';

// TODO We should provide actual fields instead of JSON

// import Field from '../../component/ui/field';

// import ModalInput from './ui/modalInput';
// import RenderAssetList from './list/renderAsset';

// import lookup from 'gl-constants/lookup';

/*
function getHandler(thisObj, handler) {
  return (e) => {
    let newValue = e.target.value;
    const { selected, execute } = thisObj.props;
    execute.apply(null, handler(selected, newValue));
  };
}
*/

class MaterialProperties extends Component {
  handleChange(e) {
    const value = e.target.value;
    let parsed;
    // Try to parse the value...
    try {
      parsed = JSON.parse(value);
    } catch (e) {
      // Do nothing if an error has occurred
      return;
    }
    this.props.execute('renderer.material.update', this.props.selected, parsed);
  }
  render() {
    const { material, selected } = this.props;
    if (material == null) return false;
    return (
      <div className='material-properties properties'>
        <MaterialActions name={selected} />
        <div className='properties-name-readonly'>
          { selected }
        </div>
        {/*
        <Section header='Shader'>
          <Field label='Shader'>
            <ModalInput value={material.shader}
              onChange={getHandler(this,
                (name, value) => ['renderer.material.update', name, {
                  shader: value
                }])}
            >
              <RenderAssetList type='shaders' />
            </ModalInput>
          </Field>
        </Section>
        */}
        <Section header='JSON'>
          <CachedTextArea
            value={JSON.stringify(material, null, 2)}
            onChange={this.handleChange.bind(this)}
            className='properties-text-area'
          />
        </Section>
      </div>
    );
  }
}

MaterialProperties.propTypes = {
  material: PropTypes.object,
  selected: PropTypes.string,
  execute: PropTypes.func
};

let checkUpdate = ([name], { selected }) => name === selected;

export default connect({
  'renderer.material.*': checkUpdate
}, (engine, { selected }) => ({
  material: engine.systems.renderer.materials[selected],
  execute: engine.actions.external.execute
}))(MaterialProperties);
