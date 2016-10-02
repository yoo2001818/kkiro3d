import { mat4 } from 'gl-matrix';

export default class CameraMatrixSystem {
  constructor() {
    this.data = [];
    this.hooks = {
      'transform.*': (entity) => {
        let data = this.data[entity.id];
        if (data != null) data.viewValid = false;
      },
      'camera.*': (entity) => {
        let data = this.data[entity.id];
        if (data != null) data.projectionValid = false;
      }
    };
  }
  attach(engine) {
    this.engine = engine;
    this.family = engine.systems.family.get('camera', 'transform');
    this.family.onAdd.add(entity => {
      this.data[entity.id] = {
        viewValid: false,
        projectionValid: false,
        aspect: 1,
        projection: null,
        projectionView: null
      };
    });
    this.family.onRemove.add(entity => {
      this.data[entity.id] = null;
    });
  }
  getView(entity) {
    return this.engine.systems.matrix.getInverse(entity);
  }
  getData(entity) {
    let data = this.data[entity.id];
    if (data == null) throw new Error('Unregistered entity');
    return data;
  }
  calculateProjection(data, camera, input) {
    let aspect;
    if (typeof input === 'number') {
      aspect = input;
    } else if (typeof input === 'object') {
      // Received a shader object - we need to get current aspect ratio.
      aspect = input.renderer.width / input.renderer.height;
    } else {
      aspect = data.aspect;
    }

    if (data.projectionValid && aspect === data.aspect) return false;
    if (data.projection == null) data.projection = mat4.create();
    data.aspect = aspect;
    data.projectionValid = true;

    const { zoom, fov, near, far } = camera;
    switch (camera.type) {
    case 'persp':
      mat4.perspective(data.projection, fov, aspect, near, far);
      break;
    case 'ortho':
      mat4.ortho(data.projection, -aspect * zoom, aspect * zoom, -zoom, zoom,
        near, far);
      break;
    default:
      throw new Error('Unknown camera type ' + camera.type);
    }

    return true;
  }
  getProjection(entity, input) {
    let data = this.getData(entity);
    let camera = entity.camera;
    this.calculateProjection(data, camera, input);
    return data.projection;
  }
  getProjectionView(entity, input) {
    let data = this.getData(entity);
    let camera = entity.camera;
    let needUpdate = this.calculateProjection(data, camera, input) ||
      !data.viewValid;
    if (!needUpdate) return data.projectionView;
    if (data.projectionView == null) data.projectionView = mat4.create();
    data.viewValid = true;
    return mat4.multiply(data.projectionView, data.projection,
      this.getView(entity));
  }
}
