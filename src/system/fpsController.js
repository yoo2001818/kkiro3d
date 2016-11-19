import { quat, mat3, vec3 } from 'gl-matrix';

let tmpQuat = quat.create();

// Used to provide FPS movement
export default class FPSControllerSystem {
  constructor() {
    this.data = [];
    this.hooks = {
      'external.load!': () => {
        this.data = [];
      },
      'fpsController.set:post!': ([entity, data]) => {
        if (data.pitch != null || data.yaw != null) {
          this.updateEntity(entity);
        }
      }
    };
  }
  attach(engine) {
    this.engine = engine;
    this.family = engine.systems.family.get('fpsController', 'transform');
    this.family.onAdd.addRaw(([entity]) => {
      this.data[entity.id] = {
        matrix: mat3.create()
      };
    });
    this.family.onRemove.addRaw(([entity]) => {
      this.data[entity.id] = null;
    });
  }
  get(entity) {
    let data = this.data[entity.id];
    if (data == null) throw new Error('Unregistered entity');
    return data;
  }
  getMatrix(entity) {
    return this.get(entity).matrix;
  }
  updateEntity(entity) {
    if (entity.transform == null) return;
    let { pitch, yaw } = entity.fpsController;
    let data = this.get(entity);
    quat.identity(tmpQuat);
    let parent = this.engine.state.entities[entity.parent];
    quat.rotateY(tmpQuat, tmpQuat, -yaw);
    if (entity.fpsController.rotateParentYaw && parent != null) {
      this.engine.actions.transform.setRotation(parent, tmpQuat);
      quat.identity(tmpQuat);
    }
    quat.rotateX(tmpQuat, tmpQuat, pitch);
    this.engine.actions.transform.setRotation(entity, tmpQuat);
    // Update matrix
    let right = data.matrix.subarray(0, 3);
    let up = data.matrix.subarray(3, 6);
    let front = data.matrix.subarray(6, 9);
    vec3.set(up, 0, 1, 0);
    vec3.set(front,
      Math.sin(yaw),
      0,
      -Math.cos(yaw)
    );
    vec3.normalize(front, front);
    vec3.cross(right, up, front);
  }
}
