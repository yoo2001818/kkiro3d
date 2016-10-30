import transform from './component/transform';

import createView from './createView';

const REGISTRY = {
  transform
};

export default function getComponent(name, schema) {
  if (REGISTRY[name]) return REGISTRY[name];
  if (schema != null) {
    REGISTRY[name] = createView(name, schema);
    return REGISTRY[name];
  }
  return null;
}
