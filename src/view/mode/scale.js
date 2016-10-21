import { vec2, vec3, vec4 } from 'gl-matrix';
import toNDC from '../../util/toNDC';

export default class ScaleMode {
  constructor(entity, ndc, alignAxis = null) {
    this.entity = entity;
    this.startScale = vec3.create();
    vec3.copy(this.startScale, this.entity.transform.scale);

    this.mouseHeld = true;
    this.ndc = ndc;

    this.scaleSize = 1;

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

    vec4.scale(perspPos, perspPos, 1 / perspPos[3]);
    this.scaleSize = vec2.distance(this.ndc, perspPos);
  }
  exit() {
    // Remove axis effect
    this.renderer.effectList.splice(this.renderer.effectList.indexOf(
      this.renderer.effects.axis
    ), 1);
  }
  setEffect() {
    this.renderer.effects.axis.color = this.align && this.alignAxis.concat([1]);
    if (this.align) {
      // Align along local axis
      let viewAxis = vec4.create();
      vec3.copy(viewAxis, this.alignAxis);
      vec4.transformMat4(viewAxis, viewAxis,
        this.engine.systems.matrix.get(this.entity));
      this.renderer.effects.axis.direction = viewAxis.subarray(0, 3);
    } else {
      this.renderer.effects.axis.direction = null;
    }
  }
  setScale(ndc) {
    // Unlike translation, this is REALLY simple :P
    let perspPos = vec4.fromValues(0, 0, 0, 1);
    vec4.transformMat4(perspPos, perspPos,
      this.engine.systems.matrix.get(this.entity));
    vec4.transformMat4(perspPos, perspPos,
      this.engine.systems.cameraMatrix.getProjectionView(this.camera));
    vec4.scale(perspPos, perspPos, 1 / perspPos[3]);
    // Tada
    let scaleVar = vec2.distance(ndc, perspPos) / this.scaleSize;
    let scale = vec3.create();
    let alignAxis = this.alignAxis;
    let entityScale = this.startScale;
    scale[0] = (alignAxis[0] * scaleVar + (1 - alignAxis[0])) * entityScale[0];
    scale[1] = (alignAxis[1] * scaleVar + (1 - alignAxis[1])) * entityScale[1];
    scale[2] = (alignAxis[2] * scaleVar + (1 - alignAxis[2])) * entityScale[2];
    this.engine.actions.external.execute('transform.setScale',
      this.entity, scale);
  }
  mousemove(e) {
    let ndc = toNDC(e.clientX, e.clientY, this.renderer);
    this.ndc = ndc;
    this.setScale(ndc);
  }
  mouseup(e) {
    if (e.buttons === 0) this.manager.pop();
  }
  keydown(e) {
    if (e.keyCode === 27) {
      this.engine.actions.external.execute('transform.setScale',
        this.entity, this.startScale);
      this.manager.pop();
    } else if (e.keyCode === 67) {
      this.align = false;
      this.alignAxis = [1, 1, 1];
      this.setScale(this.ndc);
    } else if (e.keyCode === 88) {
      this.align = true;
      this.alignAxis = [1, 0, 0];
      this.setScale(this.ndc);
    } else if (e.keyCode === 89) {
      this.align = true;
      this.alignAxis = [0, 1, 0];
      this.setScale(this.ndc);
    } else if (e.keyCode === 90) {
      this.align = true;
      this.alignAxis = [0, 0, 1];
      this.setScale(this.ndc);
    }
  }
  render() {
    this.setEffect();
  }
}
