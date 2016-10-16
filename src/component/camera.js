import { signalRaw } from 'fudge';

export default {
  component: {
    type: 'persp',
    near: 0.3,
    far: 100,
    fov: Math.PI / 180 * 70,
    zoom: 1
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
