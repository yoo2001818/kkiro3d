import { mat4 } from 'gl-matrix';

const PROJECTION_BIT = 1;
const PROJECTION_VIEW_BIT = 2;
const PROJECTION_INVERSE_BIT = 4;

export default class CameraMatrixSystem {
  constructor() {
    this.data = [];
    this.hooks = {
      'transform.*!': ([entity]) => {
        let data = this.data[entity.id];
        if (data != null) data.valid = data.valid & ~PROJECTION_VIEW_BIT;
      },
      'camera.*!': ([entity]) => {
        let data = this.data[entity.id];
        if (data != null) data.valid = 0;
      }
    };
  }
  attach(engine) {
    this.engine = engine;
    this.family = engine.systems.family.get('camera', 'transform');
    this.family.onAdd.addRaw(([entity]) => {
      this.data[entity.id] = {
        valid: 0,
        aspect: 1,
        projection: null,
        projectionView: null,
        projectionInverse: null
      };
    });
    this.family.onRemove.addRaw(([entity]) => {
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

    if ((data.valid & PROJECTION_BIT) !== 0 && aspect === data.aspect) {
      return false;
    }
    // View and inverse projection is invalidated..
    data.valid = PROJECTION_BIT;
    if (data.projection == null) data.projection = mat4.create();
    data.aspect = aspect;
    data.projectionValid = true;
    data.viewValid = false;

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
    this.calculateProjection(data, camera, input);
    if ((data.valid & PROJECTION_VIEW_BIT) === 0) {
      data.valid |= PROJECTION_VIEW_BIT;
      if (data.projectionView == null) data.projectionView = mat4.create();
      mat4.multiply(data.projectionView, data.projection,
        this.getView(entity));
    }
    return data.projectionView;
  }
  getProjectionInverse(entity, input) {
    let data = this.getData(entity);
    let camera = entity.camera;
    this.calculateProjection(data, camera, input);
    if ((data.valid & PROJECTION_INVERSE_BIT) === 0) {
      data.valid |= PROJECTION_INVERSE_BIT;
      if (data.projectionInverse == null) {
        data.projectionInverse = mat4.create();
      }
      mat4.invert(data.projectionInverse, data.projection);
    }
    return data.projectionInverse;
  }
}
