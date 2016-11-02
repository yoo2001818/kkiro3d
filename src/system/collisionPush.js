import { vec3 } from 'gl-matrix';

let tmpVec = vec3.create();
let tmpVec2 = vec3.create();

function sign(x) {
  if (x > 0) return 1;
  else return -1;
}

export default function collisionPush(engine) {
  this.looped = [];
  this.hooks = {
    'external.update!': () => {
      this.looped = [];
    },
    'collision.collide!': ([entity, other, bounds]) => {
      if (this.looped[other.id]) return;
      this.looped[other.id] = true;
      // Test - pushing other object
      vec3.subtract(tmpVec2, bounds.max, bounds.min);
      // Choose biggest one
      let channel = 0;
      if (tmpVec2[channel] > tmpVec2[1]) channel = 1;
      if (tmpVec2[channel] > tmpVec2[2]) channel = 2;
      if (channel !== 0) tmpVec2[0] = 0;
      if (channel !== 1) tmpVec2[1] = 0;
      if (channel !== 2) tmpVec2[2] = 0;
      // Find direction to push
      vec3.subtract(tmpVec, engine.systems.collision.getCenter(other),
        engine.systems.collision.getCenter(entity));
      // Sign
      tmpVec[0] = sign(tmpVec[0]);
      tmpVec[1] = sign(tmpVec[1]);
      tmpVec[2] = sign(tmpVec[2]);
      // Multiply sign
      vec3.multiply(tmpVec2, tmpVec2, tmpVec);
      engine.actions.transform.translate(other, tmpVec2, true);
    }
  };
}
