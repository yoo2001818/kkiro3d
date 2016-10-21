import { vec2, vec3, vec4, quat } from 'gl-matrix';
import toNDC from '../../util/toNDC';

export default class RotateMode {
  constructor(entity, ndc, alignAxis = null) {
    this.entity = entity;
    this.startQuat = quat.create();
    quat.copy(this.startQuat, this.entity.transform.rotation);

    this.mouseHeld = true;
    this.ndc = ndc;

    this.angle = 0;
    this.lastAngle = 0;

    this.align = alignAxis != null;
    this.alignAxis = alignAxis || [1, 1, 1];
    this.alignGlobal = false;
  }
  enter(manager) {
    this.manager = manager;
    this.engine = manager.engine;
    this.renderer = manager.renderer;
    this.renderer.effectList.push(this.renderer.effects.axis);
    this.setEffect();

    this.camera = this.renderer.viewports[0].camera;

    let perspPos = vec4.fromValues(0, 0, 0, 1);
    vec4.transformMat4(perspPos, perspPos,
      this.engine.systems.matrix.get(this.entity));
    vec4.transformMat4(perspPos, perspPos,
      this.engine.systems.cameraMatrix.getProjectionView(this.camera));
    let aspect = this.engine.systems.cameraMatrix.getCurrentAspect(this.camera);

    vec4.scale(perspPos, perspPos, 1 / perspPos[3]);
    vec2.subtract(perspPos, this.ndc, perspPos);
    this.lastAngle = Math.atan2(perspPos[1], perspPos[0] * aspect);
  }
  exit() {
    // Remove axis effect
    this.renderer.effectList.splice(this.renderer.effectList.indexOf(
      this.renderer.effects.axis
    ), 1);
  }
  setEffect() {
    this.renderer.effects.axis.direction = this.align ? this.alignAxis : null;
    this.renderer.effects.axis.color = this.align && this.alignAxis.concat([1]);
  }
  setRotation() {
    let tmpQuat = quat.create();
    let axis = this.alignAxis;
    if (!this.align) {
      // Shoot a ray from camera to model
      let matrixSys = this.engine.systems.matrix;
      let cameraPos = matrixSys.get(this.camera).subarray(12, 15);
      let entityPos = matrixSys.get(this.entity).subarray(12, 15);
      let pos = vec3.create();
      vec3.subtract(pos, cameraPos, entityPos);
      vec3.normalize(pos, pos);
      axis = pos;
    }
    quat.setAxisAngle(tmpQuat, axis, this.angle);
    quat.multiply(tmpQuat, tmpQuat, this.startQuat);
    this.engine.actions.external.execute('transform.setRotation',
      this.entity, tmpQuat);
  }
  mousemove(e) {
    let ndc = toNDC(e.clientX, e.clientY, this.renderer);
    this.ndc = ndc;
    // Get angle :S
    let perspPos = vec4.fromValues(0, 0, 0, 1);
    vec4.transformMat4(perspPos, perspPos,
      this.engine.systems.matrix.get(this.entity));
    vec4.transformMat4(perspPos, perspPos,
      this.engine.systems.cameraMatrix.getProjectionView(this.camera));
    vec4.scale(perspPos, perspPos, 1 / perspPos[3]);
    let aspect = this.engine.systems.cameraMatrix.getCurrentAspect(this.camera);
    vec2.subtract(perspPos, this.ndc, perspPos);
    let angle = Math.atan2(perspPos[1], perspPos[0] * aspect);
    let diff = angle - this.lastAngle;
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;
    this.angle += diff;
    this.lastAngle = angle;
    this.setRotation();
  }
  mouseup(e) {
    if (e.buttons === 0) this.manager.pop();
  }
  keydown(e) {
    if (e.keyCode === 27) {
      this.engine.actions.external.execute('transform.setRotation',
        this.entity, this.startQuat);
      this.manager.pop();
    } else if (e.keyCode === 67) {
      this.align = false;
      this.alignAxis = [1, 1, 1];
      this.setRotation();
      this.setEffect();
    } else if (e.keyCode === 88) {
      this.align = true;
      this.alignAxis = [1, 0, 0];
      this.setRotation();
      this.setEffect();
    } else if (e.keyCode === 89) {
      this.align = true;
      this.alignAxis = [0, 1, 0];
      this.setRotation();
      this.setEffect();
    } else if (e.keyCode === 90) {
      this.align = true;
      this.alignAxis = [0, 0, 1];
      this.setRotation();
      this.setEffect();
    }
  }
}
