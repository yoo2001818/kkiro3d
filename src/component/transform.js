import { quat, vec3 } from 'gl-matrix';
import { signalRaw } from 'fudge';
import lookAt from '../util/lookAt';

let tmp = vec3.create();
let tmpQuat = quat.create();

export default {
  component: data => ({
    position: data.position ? new Float32Array(data.position) : vec3.create(),
    scale: data.scale ? new Float32Array(data.scale) : vec3.fromValues(1, 1, 1),
    rotation: data.rotation ? new Float32Array(data.rotation) : quat.create()
  }),
  actions: {
    setPosition: signalRaw(([entity, target]) => {
      vec3.copy(entity.transform.position, target);
    }),
    translate: function (entity, target) {
      vec3.add(tmp, entity.transform.position, target);
      this.actions.transform.setPosition(entity, tmp);
    },
    setScale: signalRaw(([entity, target]) => {
      vec3.copy(entity.transform.scale, target);
    }),
    setRotation: signalRaw(([entity, target]) => {
      quat.copy(entity.transform.rotation, target);
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
