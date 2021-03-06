import { signalRaw } from 'fudge';

export default {
  component: {
    type: 'persp',
    near: 0.3,
    far: 100,
    fov: Math.PI / 180 * 70,
    zoom: 1,
    aspect: 0
  },
  schema: {
    type: {
      type: 'select',
      options: [
        {value: 'persp', label: 'Perspective'},
        {value: 'ortho', label: 'Orthogonal'}
      ]
    },
    near: { type: 'number' },
    far: { type: 'number' },
    fov: {
      type: 'degree',
      precision: 2,
      visible: entity => entity.camera.type === 'persp'
    },
    zoom: {
      type: 'number',
      visible: entity => entity.camera.type === 'ortho'
    },
    aspect: {
      type: 'number'
    },
    use: {
      type: 'button',
      value: 'Use Camera',
      setValue: (entity) => ['renderer.camera.set', entity],
      noField: true,
      className: 'properties-full-button green',
      local: true
    }
  },
  actions: {
    setPersp: signalRaw(([entity, fov, near, far]) => {
      entity.camera.type = 'persp';
      entity.camera.fov = fov;
      entity.camera.near = near;
      entity.camera.far = far;
    }),
    setOrtho: signalRaw(([entity, zoom, near, far]) => {
      entity.camera.type = 'ortho';
      entity.camera.zoom = zoom;
      entity.camera.near = near;
      entity.camera.far = far;
    }),
    set: signalRaw(([entity, data]) => {
      // I'm being lazy :/
      Object.assign(entity.camera, data);
    })
  }
};
