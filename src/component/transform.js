import { quat, vec3 } from 'gl-matrix';
import { signalRaw } from 'fudge';

let tmp = vec3.create();
let tmpQuat = quat.create();

export default {
  component: data => Object.assign({}, {
    position: vec3.create(),
    scale: vec3.fromValues(1, 1, 1),
    rotation: quat.create()
  }, data),
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
    }
  }
};
