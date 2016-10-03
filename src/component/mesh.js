import { signalRaw } from 'fudge';

export default {
  component: {
    geometry: null,
    material: null
    // TODO castShadow receiveShadow visible
  },
  actions: {
    setGeometry: signalRaw(([entity, target]) => {
      entity.mesh.geometry = target;
    }),
    setMaterial: signalRaw(([entity, target]) => {
      entity.mesh.material = target;
    })
  }
};
