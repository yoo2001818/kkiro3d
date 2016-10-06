import { vec2, vec4 } from 'gl-matrix';
import toNDC from '../../util/toNDC';

export default class TranslateMode {
  constructor(entity, ndc) {
    this.entity = entity;

    this.mouseHeld = true;
    this.mouseX = ndc[0];
    this.mouseY = ndc[1];
    this.relativeOffset = vec2.create();

    this.align = false;
    this.alignColor = '#ff0000';
    this.alignAxis = [1, 0, 0];
  }
  enter(manager) {
    this.manager = manager;
    this.engine = manager.engine;
    this.renderer = manager.renderer;

    this.camera = this.renderer.viewports[0].camera;
    // Get relative offset
    if (this.align) {
      // We're aligning to axis - Get relative offset from origin to clicked
      // point
      // Project current model position to projection space
      // (to get Z value)
      let perspPos = vec4.fromValues(0, 0, 0, 1);
      vec4.transformMat4(perspPos, perspPos,
        this.engine.systems.matrix.get(this.entity));
      vec4.transformMat4(perspPos, perspPos,
        this.engine.systems.cameraMatrix.getProjectionView(this.camera));
      vec4.scale(perspPos, perspPos, 1 / perspPos[3]);
      // Last, store relative offset for future use
      vec2.subtract(this.relativeOffset, [this.mouseX, this.mouseY], perspPos);
    }
  }
  mousemove(e) {
    let ndc = toNDC(e.clientX, e.clientY, this.renderer);
    let deltaX = ndc[0] - this.mouseX;
    let deltaY = ndc[1] - this.mouseY;
    this.mouseX = ndc[0];
    this.mouseY = ndc[1];
    if (!this.align) {
      // Freestyle translation
      // Project current model position to projection space
      let perspPos = vec4.fromValues(0, 0, 0, 1);
      vec4.transformMat4(perspPos, perspPos,
        this.engine.systems.matrix.get(this.entity));
      vec4.transformMat4(perspPos, perspPos,
        this.engine.systems.cameraMatrix.getProjectionView(this.camera));
      // vec4.scale(perspPos, perspPos, 1 / perspPos[3]);
      // Then move using delta value
      perspPos[0] += deltaX * perspPos[3];
      perspPos[1] += deltaY * perspPos[3];
      // Inverse-project to world space
      vec4.transformMat4(perspPos, perspPos,
        this.engine.systems.cameraMatrix.getProjectionInverse(this.camera));
      vec4.transformMat4(perspPos, perspPos,
        this.engine.systems.matrix.get(this.camera));
      // Last, write the pos to transform
      this.engine.actions.transform.setPosition(this.entity, perspPos);
    }
  }
  mouseup(e) {
    if (e.button === 2) this.manager.pop();
  }
}
