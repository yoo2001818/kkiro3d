import { vec3 } from 'gl-matrix';
import { signalRaw } from 'fudge';

let tmpVec = vec3.create();

export default {
  component: {
    pitch: 0,
    yaw: 0,
    speed: 8.0,
    moveParent: false,
    rotateParentYaw: false
  },
  schema: {
    pitch: {
      type: 'number'
    },
    yaw: {
      type: 'number'
    },
    speed: {
      type: 'number'
    },
    moveParent: {
      type: 'checkbox'
    },
    rotateParentYaw: {
      type: 'checkbox'
    }
  },
  actions: {
    set: signalRaw(([entity, data]) => {
      Object.assign(entity.fpsController, data);
    }),
    addRotation: function (entity, pitchAdd, yawAdd) {
      this.actions.fpsController.set(entity, {
        pitch: Math.max(-Math.PI / 2 + 0.001, Math.min(Math.PI / 2
          - 0.001, entity.fpsController.pitch + pitchAdd)),
        yaw: entity.fpsController.yaw + yawAdd
      });
    },
    move: signalRaw(function ([entity, vec, delta]) {
      // Get matrix value
      let matrix = this.systems.fpsController.getMatrix(entity);
      vec3.transformMat3(tmpVec, vec, matrix);
      vec3.scale(tmpVec, tmpVec, entity.fpsController.speed);
      vec3.scale(tmpVec, tmpVec, delta);
      if (entity.fpsController.moveParent) {
        let parent = this.state.entities[entity.parent];
        if (parent == null) return;
        this.actions.transform.translate(parent, tmpVec);
      } else {
        this.actions.transform.translate(entity, tmpVec);
      }
    })
  }
};
