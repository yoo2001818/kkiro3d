import { signalRaw } from 'fudge';

export default {
  component: {
    texture: null
  },
  schema: {
    texture: { type: 'texture' },
  },
  actions: {
    setTexture: signalRaw(([entity, target]) => {
      entity.skybox.texture = target;
    })
  }
};
