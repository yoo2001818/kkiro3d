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
  schema: {
    center: {
      type: 'vector'
    },
    radius: {
      type: 'number'
    }
  },
  channels: {
    center: {
      stride: 3,
      exec: function (entity, a, b, t) {
        vec3.lerp(vecTemp, a, b, t);
        this.actions.blenderController.setCenter(entity, vecTemp);
      }
    }
  },
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
    zoom: function (entity, delta) {
      let current = entity.blenderController.radius;
      this.actions.blenderController.setRadius(entity,
        delta * current + current
      );
    },
    setCenter: signalRaw(function ([entity, pos]) {
      vec3.copy(entity.blenderController.center, pos);
    }),
    setRadius: signalRaw(function ([entity, radius]) {
      entity.blenderController.radius = radius;
    }),
    setCamera: function (entity, perspective) {
      if (entity.camera == null) return;
      if (perspective) {
        this.actions.camera.setPersp(entity, Math.PI / 180 * 70, 0.3, 300);
      } else {
        this.actions.camera.setOrtho(entity,
          entity.blenderController.radius / 2,
          0.1, 100);
      }
    },
    set: signalRaw(([entity, data]) => {
      Object.assign(entity.blenderController, data);
    }),
    lerpCenter: function (entity, pos) {
      let data = new Float32Array(6);
      data.set(entity.blenderController.center, 0);
      data.set(pos, 3);
      let animData = {
        channel: 'blenderController.center',
        input: [0, 0.3],
        output: data,
        interpolation: 'easeInOut'
      };
      if (entity.animation == null) this.actions.entity.add.animation(entity);
      this.actions.animation.clear(entity);
      this.actions.animation.add(entity, animData);
      this.actions.animation.start(entity, 0.5, 1);
    },
    lerpRotation: function (entity, rotation) {
      let data = new Float32Array(8);
      data.set(entity.transform.rotation, 0);
      data.set(rotation, 4);
      let animData = {
        channel: 'transform.rotation',
        input: [0, 0.3],
        output: data,
        interpolation: 'easeInOut'
      };
      if (entity.animation == null) this.actions.entity.add.animation(entity);
      this.actions.animation.clear(entity);
      this.actions.animation.add(entity, animData);
      this.actions.animation.start(entity, 0.5, 1);
    }
  }
};
