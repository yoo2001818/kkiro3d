import { vec2, vec3, vec4, quat, mat4 } from 'gl-matrix';
import toNDC from '../../util/toNDC';

export default class RotateMode {
  constructor(entity, ndc, alignAxis = null) {
    this.entity = entity;
    this.startQuat = quat.create();


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
    this.engine.actions.renderer.effect.add('axis');
    this.setEffect();

    let matrixSys = this.engine.systems.matrix;
    let mat = matrixSys.get(this.entity);
    mat4.getRotation(this.startQuat, mat);
    quat.normalize(this.startQuat, this.startQuat);

    this.camera = this.engine.systems.renderer.viewportList[0].camera;

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
    this.engine.actions.renderer.effect.remove('axis');
  }
  setEffect() {
    this.renderer.effects.axis.direction = this.align ? this.alignAxis : null;
    this.renderer.effects.axis.color = this.align && this.alignAxis.concat([1]);
  }
  setRotation() {
    let tmpQuat = quat.create();
    let axis = this.alignAxis;
    let modifier = 1;
    // Shoot a ray from camera to model
    let matrixSys = this.engine.systems.matrix;
    let cameraPos = matrixSys.getPosition(this.camera);
    let entityPos = matrixSys.getPosition(this.entity);
    let cameraRay = vec3.create();
    vec3.subtract(cameraRay, cameraPos, entityPos);
    vec3.normalize(cameraRay, cameraRay);
    if (!this.align) {
      axis = cameraRay;
    } else {
      // Compare align axis and camera axis
      let cos = vec3.dot(axis, cameraRay);
      if (cos < 0) modifier = -1;
    }
    // Convert it to local space (if any)
    let parentMat = matrixSys.getParent(this.entity);
    let parentQuat = quat.create();
    mat4.getRotation(parentQuat, parentMat);
    quat.normalize(parentQuat, parentQuat);
    quat.conjugate(parentQuat, parentQuat);

    quat.setAxisAngle(tmpQuat, axis, this.angle * modifier);
    quat.multiply(tmpQuat, parentQuat, tmpQuat);
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
        this.entity, this.startQuat, true);
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
