import { quat, vec3, mat4 } from 'gl-matrix';
import { signalRaw } from 'fudge';
import lookAt from '../util/lookAt';
import getScaling from '../util/getScaling';

let tmp = vec3.create();
let tmpQuat = quat.create();

export default {
  component: (data = {}) => ({
    position: data.position ? new Float32Array(data.position) : vec3.create(),
    scale: data.scale ? new Float32Array(data.scale) : vec3.fromValues(1, 1, 1),
    rotation: data.rotation ? new Float32Array(data.rotation) : quat.create()
  }),
  actions: {
    setPosition: signalRaw(function ([entity, target, isGlobal]) {
      vec3.copy(entity.transform.position, target);
      if (isGlobal && entity.parent != null) {
        // Convert world space to model space of the parent
        let parentInv = this.systems.matrix.getParentInverse(entity);
        vec3.transformMat4(
          entity.transform.position, entity.transform.position, parentInv);
      }
    }),
    translate: function (entity, target) {
      vec3.add(tmp, entity.transform.position, target);
      this.actions.transform.setPosition(entity, tmp);
    },
    // What does local scale mean? :/
    setScale: signalRaw(function ([entity, target, isGlobal]) {
      if (isGlobal && entity.parent != null) {
        let parent = this.systems.matrix.getParent(entity);
        getScaling(tmp, parent);
        vec3.copy(entity.transform.scale, target);
        vec3.divide(entity.transform.scale, entity.transform.scale, tmp);
      } else {
        vec3.copy(entity.transform.scale, target);
      }
    }),
    setRotation: signalRaw(function ([entity, target, isGlobal]) {
      quat.copy(entity.transform.rotation, target);
      if (isGlobal && entity.parent != null) {
        // Convert world space to model space of the parent
        let parent = this.state.entities[entity.parent];
        if (parent == null) return;
        let parentMat = this.systems.matrix.get(parent);
        mat4.getRotation(tmpQuat, parentMat);
        quat.normalize(tmpQuat, tmpQuat);
        quat.conjugate(tmpQuat, tmpQuat);
        quat.multiply(
          entity.transform.rotation, tmpQuat, entity.transform.rotation);
      }
    }),
    rotateX: function (entity, target) {
      quat.rotateX(tmpQuat, entity.transform.rotation, target);
      this.actions.transform.setRotation(entity, tmpQuat);
    },
    rotateY: function (entity, target) {
      quat.rotateY(tmpQuat, entity.transform.rotation, target);
      this.actions.transform.setRotation(entity, tmpQuat);
    },
    rotateZ: function (entity, target) {
      quat.rotateZ(tmpQuat, entity.transform.rotation, target);
      this.actions.transform.setRotation(entity, tmpQuat);
    },
    lookAt: function (entity, front, up) {
      lookAt(tmpQuat, front, up);
      this.actions.transform.setRotation(entity, tmpQuat);
    },
    lookAtPos: function (entity, pos, up) {
      vec3.subtract(tmp, entity.transform.position, pos);
      vec3.normalize(tmp, tmp);
      this.actions.transform.lookAt(entity, tmp, up);
    }
  }
};
