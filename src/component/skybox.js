import { signalRaw } from 'fudge';

export default {
  component: {
    texture: null
  },
  actions: {
    setTexture: signalRaw(([entity, target]) => {
      entity.skybox.texture = target;
    })
  }
};
