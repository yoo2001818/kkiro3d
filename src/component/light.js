import { signalRaw } from 'fudge';

export default {
  component: {
    type: 'point',
    color: '#ffffff',
    ambient: 0.3,
    diffuse: 1.0,
    specular: 1.0,
    attenuation: 0.0001,
    angle: [Math.cos(22.5 * Math.PI / 180), Math.cos(27.5 * Math.PI / 180)],
    shadow: false
  },
  schema: {
    type: {
      type: 'select',
      options: [
        {value: 'point', label: 'Point'},
        {value: 'directional', label: 'Directional'},
        {value: 'spot', label: 'Spot'}
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
    angle: {
      type: 'vectorAngle',
      precision: 2,
      visible: entity => entity.light.type === 'spot',
      getValue: (entity) => entity.light.angle.map(v => Math.acos(v) * 2),
      setValue: (entity, value) => ['light.set', entity, {
        angle: value.map(v => Math.cos(v / 2))
      }]
    },
    shadow: {
      type: 'checkbox'
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
