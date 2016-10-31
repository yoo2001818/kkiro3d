import { vec3 } from 'gl-matrix';

let tmpVec = vec3.create();

export default class CollisionSystem {
  constructor() {
    this.data = [];
    this.hooks = {
      'external.load!': () => {
        this.data = [];
      },
      'collision.set!': ([entity]) => {
        this.data[entity.id].valid = false;
      }
    };
  }
  attach(engine) {
    this.engine = engine;
    this.family = engine.systems.family.get('collision', 'transform');
    this.family.onAdd.addRaw(([entity]) => {
      this.data[entity.id] = {
        valid: false,
        ticks: -1,
        aabbMin: vec3.create(),
        aabbMax: vec3.create()
      };
    });
    this.family.onRemove.addRaw(([entity]) => {
      this.data[entity.id] = null;
    });
  }
  getData(entity) {
    let data = this.data[entity.id];
    if (data == null) throw new Error('Unregistered entity');
    return data;
  }
  calculateBounds(entity, data = this.getData(entity)) {
    let matrixData = this.engine.systems.matrix.getData(entity);
    let model = this.engine.systems.matrix.get(entity, matrixData);
    // Use cache if valid
    if (matrixData.ticks === data.ticks && data.valid) return;
    data.ticks = matrixData.ticks;
    data.valid = true;
    // Calculate boundary matrix..
    // We only have AABBs for now. :P
    vec3.set(data.aabbMin, Infinity, Infinity, Infinity);
    vec3.set(data.aabbMax, -Infinity, -Infinity, -Infinity);
    // What the heck
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          tmpVec[0] = x * entity.collision.size[0] + entity.collision.center[0];
          tmpVec[1] = y * entity.collision.size[1] + entity.collision.center[1];
          tmpVec[2] = z * entity.collision.size[2] + entity.collision.center[2];
          vec3.transformMat4(tmpVec, tmpVec, model);
          vec3.min(data.aabbMin, data.aabbMin, tmpVec);
          vec3.max(data.aabbMax, data.aabbMax, tmpVec);
        }
      }
    }
  }
  getAABBMin(entity, data = this.getData(entity)) {
    this.calculateBounds(entity, data);
    return data.aabbMin;
  }
  getAABBMax(entity, data = this.getData(entity)) {
    this.calculateBounds(entity, data);
    return data.aabbMax;
  }
}
