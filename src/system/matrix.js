import { mat3, mat4 } from 'gl-matrix';
import getScaling from '../util/getScaling';

const MAT4_IDENTITY = mat4.create();

// Local bits
const LOCAL_MATRIX_BIT = 1;
const LOCAL_NORMAL_BIT = 2;
const LOCAL_INVERSE_BIT = 4;
// Parent bits
// MATRIX_BIT acts differently - it marks the invalidity of local matrix.
// When a matrix retrival is requested, it'll compare BOTH parent ticks and
// MATRIX_BIT. Then it'll invalidate NORMAL_BIT and INVERSE_BIT. Easy!
const MATRIX_BIT = 8;
const NORMAL_BIT = 16;
const INVERSE_BIT = 32;

function getNormalFromInverse(output, input) {
  output[0] = input[0];
  output[1] = input[4];
  output[2] = input[8];
  output[3] = input[1];
  output[4] = input[5];
  output[5] = input[9];
  output[6] = input[2];
  output[7] = input[6];
  output[8] = input[10];
  return output;
}

export default class MatrixSystem {
  constructor(engine) {
    this.engine = engine;
    this.hooks = {
      'external.load!': () => {
        this.data = [];
      },
      'parent.set!': ([entity]) => {
        if (entity.transform == null) return;
        // Invalidate parent... at all.
        this.data[entity.id].parentTicks = -1;
      },
      'transform.*!': ([entity]) => {
        this.data[entity.id].valid = 0;
      },
      'entity.add.transform:post!': ([entity]) => {
        this.data[entity.id] = {
          valid: 0,
          ticks: 0,
          parentTicks: -1,
          localMatrix: null,
          // Do we really need local normal?
          localNormal: null,
          localInverse: null,
          matrix: null,
          normal: null,
          inverse: null
        };
      },
      'entity.remove.transform:post!': ([entity]) => {
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
  getLocal(entity, data = this.getData(entity), doTick) {
    let transform = entity.transform;
    // This looks... absurd?
    if ((data.valid & LOCAL_MATRIX_BIT) !== 0) return data.localMatrix;
    if (data.localMatrix == null) data.localMatrix = mat4.create();
    data.valid |= LOCAL_MATRIX_BIT;
    if (!doTick) data.ticks ++;
    mat4.fromRotationTranslation(data.localMatrix, transform.rotation,
      transform.position);
    mat4.scale(data.localMatrix, data.localMatrix, transform.scale);
    return data.localMatrix;
  }
  getLocalInverse(entity, data = this.getData(entity)) {
    if (data.localInverse == null) data.localInverse = mat4.create();
    if ((data.valid & LOCAL_INVERSE_BIT) === 0) {
      this.getLocal(entity, data);
      data.valid |= LOCAL_INVERSE_BIT;
      mat4.invert(data.localInverse, data.localMatrix);
    }
    return data.localInverse;
  }
  getLocalNormal(entity, data = this.getData(entity)) {
    if (data.localNormal == null) data.localNormal = mat3.create();
    if ((data.valid & LOCAL_NORMAL_BIT) === 0) {
      data.valid |= LOCAL_NORMAL_BIT;
      if (data.localInverse == null) {
        this.getLocal(entity, data);
        // It's much cheaper to calculate only normal matrix if inverse matrix
        // is not used.
        // TODO What if inverse matrix is not being used anymore?
        mat3.normalFromMat4(data.localNormal, data.localMatrix);
      } else {
        // Or, we work from inverted matrix.
        this.getLocalInverse(entity, data);
        getNormalFromInverse(data.localNormal, data.localInverse);
      }
    }
    return data.localNormal;
  }
  get(entity, data = this.getData(entity)) {
    // Check parent component's presence.
    if (entity.parent == null) return this.getLocal(entity, data);
    // Check parent entity's actual presence.
    let parentEntity = this.engine.state.entities[entity.parent];
    let parentData = this.data[entity.parent];
    // Bail out if it doesn't exists.
    if (parentEntity == null || parentData == null) {
      return this.getLocal(entity, data);
    }
    let parentMatrix = this.get(parentEntity, parentData);
    // Check if we can use the cache.
    if (parentData.ticks === data.parentTicks &&
      (data.valid & MATRIX_BIT) === MATRIX_BIT
    ) {
      return data.matrix;
    }
    data.parentTicks = parentData.ticks;
    data.ticks ++;
    data.valid |= MATRIX_BIT;
    // Clear normal and inverse matrix.
    data.valid &= 0xf;
    if (data.matrix == null) data.matrix = mat4.create();
    let localMatrix = this.getLocal(entity, data, true);
    // All done! Let's calculate the value...
    mat4.multiply(data.matrix, parentMatrix, localMatrix);
    return data.matrix;
  }
  getInverse(entity, data = this.getData(entity), noCheck) {
    if (data.inverse == null) data.inverse = mat4.create();
    // Unlike local ones, we're not sure if it's totally valid unless checked.
    let matrix = data.matrix || data.localMatrix;
    if (!noCheck) matrix = this.get(entity, data);
    if ((data.valid & INVERSE_BIT) === 0) {
      data.valid |= INVERSE_BIT;
      mat4.invert(data.inverse, matrix);
    }
    return data.inverse;
  }
  getNormal(entity, data = this.getData(entity)) {
    if (data.normal == null) data.normal = mat3.create();
    let matrix = this.get(entity, data);
    if ((data.valid & NORMAL_BIT) === 0) {
      data.valid |= NORMAL_BIT;
      if (data.inverse == null) {
        // It's much cheaper to calculate only normal matrix if inverse matrix
        // is not used.
        // TODO What if inverse matrix is not being used anymore?
        mat3.normalFromMat4(data.normal, matrix);
      } else {
        // Or, we work from inverted matrix.
        let inverse = this.getInverse(entity, data, true);
        getNormalFromInverse(data.normal, inverse);
      }
    }
    return data.normal;
  }
  // Some utility functions I think?
  getPosition(entity) {
    let matrix = this.get(entity);
    return matrix.subarray(12, 15);
  }
  getRotation(out, entity) {
    let matrix = this.get(entity);
    return mat4.getRotation(out, matrix);
  }
  getScale(out, entity) {
    let matrix = this.get(entity);
    return getScaling(out, matrix);
  }
  // Get parent model space
  getParent(entity) {
    if (entity.parent == null) return MAT4_IDENTITY;
    let parent = this.engine.state.entities[entity.parent];
    if (parent == null) return MAT4_IDENTITY;
    return this.get(parent);
  }
  getParentInverse(entity) {
    if (entity.parent == null) return MAT4_IDENTITY;
    let parent = this.engine.state.entities[entity.parent];
    if (parent == null) return MAT4_IDENTITY;
    return this.getInverse(parent);
  }
}
