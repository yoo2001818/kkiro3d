import { vec2, vec3, vec4 } from 'gl-matrix';
import toNDC from '../../util/toNDC';

export default class TranslateMode {
  constructor(entity, ndc) {
    this.entity = entity;
    this.startPos = vec3.create();
    vec3.copy(this.startPos, this.entity.transform.position);

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
    } else {
      // How much should it move in viewport space in order to move (1, 0, 0)?
      // Project current model position to projection space
      let perspPos = vec4.fromValues(0, 0, 0, 1);
      vec3.copy(perspPos, this.startPos);
      let addedPos = vec4.create();
      addedPos[3] = 1;
      vec3.add(addedPos, perspPos, this.alignAxis);
      vec4.transformMat4(perspPos, perspPos,
        this.engine.systems.cameraMatrix.getProjectionView(this.camera));
      vec4.transformMat4(addedPos, addedPos,
        this.engine.systems.cameraMatrix.getProjectionView(this.camera));
      let centerPos = vec2.create();
      vec2.copy(centerPos, perspPos);
      vec2.scale(centerPos, centerPos, 1 / perspPos[3]);
      let dirPos = vec2.create();
      vec2.copy(dirPos, addedPos);
      vec2.scale(dirPos, dirPos, 1 / addedPos[3]);
      vec2.subtract(dirPos, dirPos, centerPos);
      let dirNorm = vec2.create();
      vec2.normalize(dirNorm, dirPos);
      // Now we've got everything, calculated required transform length
      // and translate to it
      let projected = vec2.create();
      vec2.subtract(projected, ndc, centerPos);
      vec2.subtract(projected, projected, this.relativeOffset);
      let dist = vec2.dot(projected, dirNorm);
      let transSize = dist / vec2.length(dirPos);
      let translation = vec3.create();
      vec3.copy(translation, this.alignAxis);
      vec3.scale(translation, translation, transSize);
      let pos = vec3.create();
      vec3.add(pos, translation, this.startPos);
      // Last, write the pos to transform
      this.engine.actions.transform.setPosition(this.entity, pos);
    }
  }
  mouseup(e) {
    if (e.button === 2) this.manager.pop();
  }
  keydown(e) {
    if (e.keyCode === 67) {
      this.align = false;
    } else if (e.keyCode === 88) {
      this.align = true;
      this.alignColor = '#ff0000';
      this.alignAxis = [1, 0, 0];
    } else if (e.keyCode === 89) {
      this.align = true;
      this.alignColor = '#00ff00';
      this.alignAxis = [0, 1, 0];
    } else if (e.keyCode === 90) {
      this.align = true;
      this.alignColor = '#0000ff';
      this.alignAxis = [0, 0, 1];
    }
  }
}
