import { quat, vec3 } from 'gl-matrix';
import { signalRaw } from 'fudge';

let rotTemp = quat.create();
let vecTemp = vec3.create();
let vecTemp2 = vec3.create();

export default {
  component: data => Object.assign({}, {
    center: vec3.create(),
    radius: 5
  }, data),
  actions: {
    rotate: function (entity, x, y) {
      quat.identity(rotTemp);
      quat.rotateY(rotTemp, rotTemp, x);
      quat.multiply(rotTemp, rotTemp, entity.transform.rotation);
      quat.rotateX(rotTemp, rotTemp, y);
      this.actions.transform.setRotation(entity, rotTemp);
    },
    translate: function (entity, x, y) {
      vec3.transformQuat(vecTemp, [-x * entity.blenderController.radius, 0, 0],
        entity.transform.rotation);
      vec3.transformQuat(vecTemp2, [0, y * entity.blenderController.radius, 0],
        entity.transform.rotation);
      vec3.add(vecTemp, vecTemp, vecTemp2);
      vec3.add(vecTemp, vecTemp, entity.blenderController.center);
      this.actions.blenderController.setCenter(entity, vecTemp);
    },
    zoom: signalRaw(function ([entity, delta]) {
      entity.blenderController.radius += delta *
        entity.blenderController.radius;
    }),
    setCenter: signalRaw(function ([entity, pos]) {
      vec3.copy(entity.blenderController.center, pos);
    }),
    setCamera: function (entity, perspective) {
      if (perspective) {
        this.actions.camera.setPersp(entity, Math.PI / 180 * 70, 0.3, 300);
      } else {
        this.actions.camera.setOrtho(entity,
          entity.blenderController.radius / 2,
          0.1, 100);
      }
    },
    lerpCenter: function (entity, pos) {
      // TODO
      this.actions.blenderController.setCenter(entity, pos);
    },
    lerpRotation: function (entity, rotation) {
      // TODO
      this.actions.transform.setRotation(entity, rotation);
    }
  }
};
