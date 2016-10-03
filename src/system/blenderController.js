import { vec3 } from 'gl-matrix';

let vecTemp = vec3.create();

export default class BlenderControllerSystem {
  constructor(engine) {
    this.engine = engine;
    this.hooks = {
      'blenderController.zoom:post!': ([entity]) => {
        if (entity.camera == null) return;
        // Update camera projection
        if (entity.camera.type === 'ortho') {
          this.engine.actions.camera.setOrtho(entity,
            entity.blenderController.radius / 2,
            0.1, 100);
        }
      },
      'blenderController.*:post!': ([entity]) => {
        this.setPosition(entity);
      },
      'transform.setRotation:post!': ([entity]) => {
        this.setPosition(entity);
      }
    };
  }
  setPosition(entity) {
    if (entity.blenderController == null) return;
    if (entity.transform == null) return;
    // Update camera position
    vec3.transformQuat(vecTemp, [0, 0, entity.blenderController.radius],
      entity.transform.rotation);
    vec3.add(vecTemp, vecTemp, entity.blenderController.center);
    this.engine.actions.transform.setPosition(entity, vecTemp);
  }
}
