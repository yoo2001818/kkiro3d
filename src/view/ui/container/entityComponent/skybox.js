import React, { Component, PropTypes } from 'react';
import connectComponent from '../../util/connectComponent';
import getHandler from '../../util/getComponentHandler';

import EntityComponentSection from '../../component/entityComponentSection';
import Field from '../../component/ui/field';

import ModalInput from '../ui/modalInput';
import RenderAssetList from '../list/renderAsset';

class EntityComponentSkybox extends Component {
  render() {
    const { entity, execute } = this.props;
    return (
      <EntityComponentSection className='entity-component-skybox'
        header='Skybox'
        onRemove={() => execute('entity.remove.skybox', entity)}
      >
        <Field label='Texture'>
          <ModalInput value={entity.skybox.texture}
            onChange={getHandler(this,
              (entity, value) => ['skybox.setTexture', entity, value])}
          >
            <RenderAssetList type='textures' />
          </ModalInput>
        </Field>
      </EntityComponentSection>
    );
  }
}

EntityComponentSkybox.propTypes = {
  entity: PropTypes.object.isRequired,
  execute: PropTypes.func.isRequired
};

export default connectComponent(['skybox.*'])(EntityComponentSkybox);
