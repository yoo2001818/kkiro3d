import { vec2, vec3, vec4 } from 'gl-matrix';
import toNDC from '../../util/toNDC';

export default class TranslateMode {
  constructor(entity, ndc, alignAxis = null) {
    this.entity = entity;
    this.startPos = vec3.create();

    this.mouseHeld = true;
    this.ndc = ndc;
    this.relativeOffset = vec2.create();

    this.align = alignAxis != null;
    this.alignAxis = alignAxis;
  }
  enter(manager) {
    this.manager = manager;
    this.engine = manager.engine;
    this.renderer = manager.renderer;
    this.engine.actions.renderer.effect.add('axis');
    this.setEffect();

    this.camera = this.renderer.viewports[0].camera;

    vec3.copy(this.startPos, this.engine.systems.matrix
      .getPosition(this.entity));

    let perspPos = vec4.fromValues(0, 0, 0, 1);
    vec4.transformMat4(perspPos, perspPos,
      this.engine.systems.matrix.get(this.entity));
    vec4.transformMat4(perspPos, perspPos,
      this.engine.systems.cameraMatrix.getProjectionView(this.camera));

    vec4.scale(perspPos, perspPos, 1 / perspPos[3]);
    vec2.subtract(this.relativeOffset, this.ndc, perspPos);
  }
  exit() {
    // Remove axis effect
    this.engine.actions.renderer.effect.remove('axis');
  }
  setEffect() {
    this.renderer.effects.axis.direction = this.align ? this.alignAxis : null;
    this.renderer.effects.axis.color = this.align && this.alignAxis.concat([1]);
  }
  setPos(ndc) {
    if (!this.align) {
      // Freestyle translation
      // Project current model position to projection space
      let perspPos = vec4.fromValues(0, 0, 0, 1);
      vec3.copy(perspPos, this.startPos);
      vec4.transformMat4(perspPos, perspPos,
        this.engine.systems.cameraMatrix.getProjectionView(this.camera));
      // vec4.scale(perspPos, perspPos, 1 / perspPos[3]);
      // Then move using delta value
      perspPos[0] = ndc[0] * perspPos[3];
      perspPos[1] = ndc[1] * perspPos[3];
      // Inverse-project to world space
      vec4.transformMat4(perspPos, perspPos,
        this.engine.systems.cameraMatrix.getProjectionInverse(this.camera));
      vec4.transformMat4(perspPos, perspPos,
        this.engine.systems.matrix.get(this.camera));
      // Last, write the pos to transform
      this.engine.actions.external.execute('transform.setPosition',
        this.entity, perspPos, true);
    } else {
      // Project current model position to projection space
      let perspPos = vec4.fromValues(0, 0, 0, 1);
      vec3.copy(perspPos, this.startPos);
      let addedPos = vec4.create();
      vec3.copy(addedPos, this.alignAxis);
      vec4.transformMat4(perspPos, perspPos,
        this.engine.systems.cameraMatrix.getProjectionView(this.camera));
      vec4.transformMat4(addedPos, addedPos,
        this.engine.systems.cameraMatrix.getProjectionView(this.camera));
      // Use biggest value of X or Y, since too low value can lead to
      // division by zero or something
      let index = Math.abs(addedPos[0]) > Math.abs(addedPos[1]) ? 0 : 1;
      // n = (x0-w0 x)/(x ω1-x1)
      let distance = (perspPos[index] - perspPos[3] * ndc[index]) /
        (addedPos[3] * ndc[index] - addedPos[index]);
      let translation = vec3.create();
      vec3.copy(translation, this.alignAxis);
      vec3.scale(translation, translation, distance);
      let pos = vec3.create();
      vec3.add(pos, translation, this.startPos);
      // Last, write the pos to transform
      this.engine.actions.external.execute('transform.setPosition',
        this.entity, pos, true);
    }
  }
  mousemove(e) {
    let ndc = toNDC(e.clientX, e.clientY, this.renderer);
    this.ndc = ndc;
    vec2.subtract(ndc, ndc, this.relativeOffset);
    this.setPos(ndc);
  }
  mouseup(e) {
    if (e.buttons === 0) this.manager.pop();
  }
  keydown(e) {
    if (e.keyCode === 27) {
      this.engine.actions.external.execute('transform.setPosition',
        this.entity, this.startPos, true);
      this.manager.pop();
    } else if (e.keyCode === 67) {
      this.align = false;
      this.setEffect();
      this.setPos(this.ndc);
    } else if (e.keyCode === 88) {
      this.align = true;
      this.alignAxis = [1, 0, 0];
      this.setEffect();
      this.setPos(this.ndc);
    } else if (e.keyCode === 89) {
      this.align = true;
      this.alignAxis = [0, 1, 0];
      this.setEffect();
      this.setPos(this.ndc);
    } else if (e.keyCode === 90) {
      this.align = true;
      this.alignAxis = [0, 0, 1];
      this.setEffect();
      this.setPos(this.ndc);
    }
  }
}
