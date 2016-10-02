import { signal } from 'fudge';

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
    setType: signal((entity, type) => {
      entity.light.type = type;
    }),
    setColor: signal((entity, color) => {
      entity.light.color = color;
    }),
    setIntensity: signal((entity, ambient, diffuse, specular, attenuation) => {
      entity.light.ambient = ambient;
      entity.light.diffuse = diffuse;
      entity.light.specular = specular;
      entity.light.attenuation = attenuation;
    })
  }
};
