import { signal } from 'fudge';

export default {
  component: {
    geometry: null,
    material: null
    // TODO castShadow receiveShadow visible
  },
  actions: {
    setGeometry: signal((entity, target) => {
      entity.mesh.geometry = target;
    }),
    setMaterial: signal((entity, target) => {
      entity.mesh.material = target;
    })
  }
};
