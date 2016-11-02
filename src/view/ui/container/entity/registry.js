import transform from './component/transform';

import createView from './createView';

const REGISTRY = {
  transform
};

export default function getComponent(name, data) {
  if (REGISTRY[name]) return REGISTRY[name];
  if (data != null && data.schema != null) {
    REGISTRY[name] = createView(name, data);
    return REGISTRY[name];
  }
  return null;
}
