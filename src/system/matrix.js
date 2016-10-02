import { mat3, mat4 } from 'gl-matrix';

// Why are we even doing this
const MATRIX_BIT = 1;
const NORMAL_BIT = 2;
const INVERSE_BIT = 4;

// TODO Matrix parent

export default class MatrixSystem {
  constructor(engine) {
    this.engine = engine;
    this.hooks = {
      'transform.*': (entity) => {
        this.data[entity.id].valid = 0;
      },
      'entity.add.transform:post': (entity) => {
        this.data[entity.id] = {
          valid: 0,
          matrix: null,
          normal: null,
          inverse: null
        };
      },
      'entity.remove.transform:post': (entity) => {
        this.data[entity.id] = null;
      }
    };
    // TODO We could use Float32Array and stuff for optimization
    // But that's quite costy due to memory reallocation :/
    this.data = [];
  }
  getData(entity) {
    let data = this.data[entity.id];
    if (data == null) throw new Error('Unregistered entity');
    return data;
  }
  get(entity) {
    let data = this.getData(entity);
    let transform = entity.transform;
    if ((data.valid & MATRIX_BIT) === 0) {
      this.calculateMatrix(data, transform);
    }
    return data.matrix;
  }
  calculateMatrix(data, transform) {
    if (data.matrix == null) data.matrix = mat4.create();
    data.valid |= MATRIX_BIT;
    mat4.fromRotationTranslation(data.matrix, transform.rotation,
      transform.position);
    mat4.scale(data.matrix, data.matrix, transform.scale);
    return data.matrix;
  }
  getInverse(entity) {
    let data = this.getData(entity);
    let transform = entity.transform;
    if (data.inverse == null) data.inverse = mat4.create();
    if ((data.valid & INVERSE_BIT) === 0) {
      if ((data.valid & MATRIX_BIT) === 0) {
        this.calculateMatrix(data, transform);
      }
      data.valid |= INVERSE_BIT;
      mat4.invert(data.inverse, data.matrix);
    }
    return data.inverse;
  }
  getNormal(entity) {
    let data = this.getData(entity);
    let transform = entity.transform;
    if (data.normal == null) data.normal = mat3.create();
    if ((data.valid & NORMAL_BIT) === 0) {
      if ((data.valid & MATRIX_BIT) === 0) {
        this.calculateMatrix(data, transform);
      }
      data.valid |= NORMAL_BIT;
      if (data.inverse == null) {
        // It's much cheaper to calculate only normal matrix if inverse matrix
        // is not used.
        mat3.normalFromMat4(data.normal, data.matrix);
      } else {
        // Or, we work from inverted matrix.
        if ((data.valid & INVERSE_BIT) === 0) {
          data.valid |= INVERSE_BIT;
          mat4.invert(data.inverse, data.matrix);
        }
        // This is so weird
        data.normal[0] = data.inverse[0];
        data.normal[1] = data.inverse[4];
        data.normal[2] = data.inverse[8];
        data.normal[3] = data.inverse[1];
        data.normal[4] = data.inverse[5];
        data.normal[5] = data.inverse[9];
        data.normal[6] = data.inverse[2];
        data.normal[7] = data.inverse[6];
        data.normal[8] = data.inverse[10];
      }
    }
    return data.normal;
  }
}
