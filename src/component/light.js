import { signalRaw } from 'fudge';

export default {
  component: {
    type: 'point',
    color: '#ffffff',
    ambient: 0.3,
    diffuse: 1.0,
    specular: 1.0,
    attenuation: 0.0001,
    shadow: false,
    shadowRes: 256
  },
  schema: {
    type: {
      type: 'select',
      options: [
        {value: 'point', label: 'Point'},
        {value: 'directional', label: 'Directional'}
      ]
    },
    color: {
      type: 'color'
    },
    ambient: {
      type: 'number',
      precision: 5
    },
    diffuse: {
      type: 'number',
      precision: 5
    },
    specular: {
      type: 'number',
      precision: 5
    },
    attenuation: {
      type: 'number',
      precision: 5,
      visible: entity => entity.light.type !== 'directional'
    },
    shadow: {
      type: 'checkbox'
    },
    shadowRes: {
      type: 'integer'
    }
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
