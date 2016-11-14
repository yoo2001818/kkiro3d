import React, { PropTypes } from 'react';
import CachedTextInput from '../../component/ui/cachedTextInput';
import CachedTextArea from '../../component/ui/cachedTextArea';
import VectorInput from '../../component/ui/vectorInput';
import NumberInput from '../../component/ui/numberInput';
import SelectInput from '../../component/ui/selectInput';
import CheckboxInput from '../../component/ui/checkboxInput';
import EntityInput from '../ui/entityInput';
import EntityList from '../list/entity';
import ModalInput from '../ui/modalInput';
import RenderAssetList from '../list/renderAsset';

export const vector = (value, callback, props) => (
  <VectorInput value={value} onChange={callback} {...props} />
);

export const vectorAngle = (value, callback, props) => (
  <VectorInput value={value.map(v => v / Math.PI * 180)}
    onChange={e => callback({
      target: {
        value: e.target.value.map(v => v * Math.PI / 180)
      }
    })}
    className='degree'
    {...props}
  />
);

export const number = (value, callback, props) => (
  <NumberInput
    value={value}
    onChange={e => callback({
      target: {
        value: parseFloat(e.target.value)
      }
    })}
    {...props}
  />
);

export const integer = (value, callback, props) => (
  <NumberInput
    value={value}
    onChange={e => callback({
      target: {
        value: parseInt(e.target.value)
      }
    })}
    precision={0}
    {...props}
  />
);

export const degree = (value, callback, props) => (
  <NumberInput
    value={value / Math.PI * 180}
    onChange={e => callback({
      target: {
        value: parseFloat(e.target.value) * Math.PI / 180
      }
    })}
    className='degree'
    {...props}
  />
);

export const button = (value, callback, props) => (
  <button onClick={callback} className={props.className} key={props.key}>
    {props.value}
  </button>
);

// What the heck is wrong with eslint?
button.propTypes = {
  value: PropTypes.node,
  className: PropTypes.string,
  key: PropTypes.any
};

export const select = (value, callback, props) => (
  <SelectInput value={value} onChange={callback} className='list' {...props} />
);

export const checkbox = (value, callback, props) => (
  <CheckboxInput value={value} onChange={callback} {...props} />
);

export const string = (value, callback, props) => (
  <CachedTextInput value={value} onChange={callback} {...props} />
);

export const text = (value, callback, props) => (
  <CachedTextArea value={value} onChange={callback} {...props} />
);

export const rawString = (value, callback, props) => (
  <input {...props} type='text' value={value} onChange={callback} />
);

export const color = (value, callback, props) => (
  <input type='color' value={value} onChange={callback} {...props} />
);

export const entity = (value, callback, props) => (
  <EntityInput value={value} onChange={callback} {...props}>
    <EntityList allowNull />
  </EntityInput>
);

export const material = (value, callback, props) => (
  <ModalInput value={value} onChange={callback} {...props}>
    <RenderAssetList type='material' />
  </ModalInput>
);

export const geometry = (value, callback, props) => (
  <ModalInput value={value} onChange={callback} {...props}>
    <RenderAssetList type='geometry' />
  </ModalInput>
);

export const shader = (value, callback, props) => (
  <ModalInput value={value} onChange={callback} {...props}>
    <RenderAssetList type='shader' />
  </ModalInput>
);

export const texture = (value, callback, props) => (
  <ModalInput value={value} onChange={callback} {...props}>
    <RenderAssetList type='texture' />
  </ModalInput>
);

export const json = (value, callback, props) => (
  <CachedTextArea
    value={JSON.stringify(value, null, 2)}
    onChange={(e) => {
      const value = e.target.value;
      let parsed;
      // Try to parse the value...
      try {
        parsed = JSON.parse(value);
      } catch (e) {
        // Do nothing if an error has occurred
        return;
      }
      callback({
        target: {
          value: parsed
        }
      });
    }}
    className='properties-text-area'
    {...props}
  />
);
