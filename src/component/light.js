import { signalRaw } from 'fudge';

export default {
  component: {
    type: 'point',
    color: '#ffffff',
    ambient: 0.3,
    diffuse: 1.0,
    specular: 1.0,
    attenuation: 0.0001
  },
  actions: {
    setType: signalRaw(([entity, type]) => {
      entity.light.type = type;
    }),
    setColor: signalRaw(([entity, color]) => {
      entity.light.color = color;
    }),
    setIntensity: signalRaw(([entity, ambient, diffuse, specular, attenu]) => {
      entity.light.ambient = ambient;
      entity.light.diffuse = diffuse;
      entity.light.specular = specular;
      entity.light.attenuation = attenu;
    }),
    set: signalRaw(([entity, data]) => {
      // I'm being lazy (again)
      Object.assign(entity.light, data);
    })
  }
};
