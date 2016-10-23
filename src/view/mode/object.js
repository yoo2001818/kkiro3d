import { vec2, vec3, vec4, quat } from 'gl-matrix';
import toNDC from '../../util/toNDC';
import TranslateMode from './translate';
import ScaleMode from './scale';
import RotateMode from './rotate';

let tempQuat = quat.create();

export default class ObjectAction {
  constructor() {
    this.rightHeld = false;
    this.mouseHeld = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.rotateDir = 0;
  }
  enter(manager) {
    this.manager = manager;
    this.engine = manager.engine;
    this.renderer = manager.renderer;
    this.rightHeld = false;
    this.mouseHeld = false;
  }
  exit() {

  }
  getCamera() {
    return this.renderer.viewports[0].camera;
  }
  mousemove(e) {
    let offsetX = e.clientX - this.mouseX;
    let offsetY = e.clientY - this.mouseY;
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    if (this.rightHeld &&
      Math.sqrt(offsetX * offsetX + offsetY * offsetY) > 4
    ) {
      let prevEntity = this.engine.state.entities[this.engine.state.global.
        selectedEntity];
      if (prevEntity == null) return;
      this.manager.push(new TranslateMode(prevEntity,
        toNDC(this.mouseX, this.mouseY, this.renderer)
      ));
      return;
    }
    if (!this.mouseHeld) return;
    if (e.shiftKey) {
      this.engine.actions.external.execute('blenderController.translate',
        this.getCamera(), offsetX / 600, offsetY / 600);
      return;
    }
    this.engine.actions.external.execute('blenderController.rotate',
      this.getCamera(), Math.PI / 180 * -offsetX * this.rotateDir / 4,
      Math.PI / 180 * -offsetY / 4);
  }
  contextmenu(e) {
    e.preventDefault();
  }
  mousedown(e) {
    // Set position
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    if (e.button === 2) {
      // Initiate mouse pick
      let id = this.renderer.effects.mousePick.pick(e.clientX, e.clientY);
      let entity = this.engine.state.entities[id];
      if (entity == null) return;
      this.rightHeld = true;
      this.engine.actions.external.execute('editor.selectEntity', entity);
      return;
    }
    if (e.button === 0) {
      let prevEntity = this.engine.state.entities[this.engine.state.global.
        selectedEntity];
      if (prevEntity != null) {
        // Project the widget axis to screen
        let ndc = toNDC(this.mouseX, this.mouseY, this.renderer);
        let camera = this.getCamera();
        let projection = this.engine.systems.cameraMatrix.
          getProjection(camera);
        let projView = this.engine.systems.cameraMatrix.
          getProjectionView(camera);
        let perspPos = vec4.fromValues(0, 0, 0, 1);
        vec4.transformMat4(perspPos, perspPos,
          this.engine.systems.matrix.get(prevEntity));
        vec4.transformMat4(perspPos, perspPos, projView);
        let startPos = vec4.create();
        vec2.scale(startPos, perspPos, 1 / perspPos[3]);
        let result = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].some(input => {
          let axis = vec4.create();
          vec3.copy(axis, input);
          vec4.transformMat4(axis, axis, projView);
          if (camera.camera.type === 'ortho') {
            vec4.scale(axis, axis, 1 / projection[5] * 0.3);
          } else {
            vec4.scale(axis, axis, perspPos[3] * 0.2);
          }
          let endPos = vec4.create();
          vec4.add(endPos, perspPos, axis);
          vec2.scale(endPos, endPos, 1 / endPos[3]);
          // Translate...
          vec2.subtract(endPos, endPos, startPos);
          let endDist = vec2.length(endPos);
          let endNorm = vec2.create();
          vec2.scale(endNorm, endPos, 1 / endDist);
          let ndcTranslated = vec2.create();
          vec2.subtract(ndcTranslated, ndc, startPos);
          // Try to project ndc to axis
          let a1 = vec2.dot(ndcTranslated, endNorm);
          let v1 = vec2.create();
          vec2.scale(v1, endNorm, a1);
          let v2 = vec2.create();
          vec2.subtract(v2, ndcTranslated, v1);
          let a2 = vec2.length(v2);
          if (a1 > 0 && a1 < endDist && a2 < 0.023) {
            this.manager.push(new TranslateMode(prevEntity,
              toNDC(this.mouseX, this.mouseY, this.renderer),
              input
            ));
            return true;
          }
        });
        if (result) return;
      }
      // Run depth pick
      let pos = this.renderer.effects.depthPick.pick(e.clientX, e.clientY);
      if (pos == null) {
        // Set the position to current XY, while preserving Z value
        // Of course, this requires previous cursor value
        let prevPos = this.engine.state.global.cursor;
        if (prevPos == null) return;
        let ndc = toNDC(this.mouseX, this.mouseY, this.renderer);
        let camera = this.getCamera();
        // Project current position to projection space
        let perspPos = vec4.fromValues(0, 0, 0, 1);
        vec3.copy(perspPos, prevPos);
        vec4.transformMat4(perspPos, perspPos,
          this.engine.systems.cameraMatrix.getProjectionView(camera));
        // vec4.scale(perspPos, perspPos, 1 / perspPos[3]);
        // Then move using delta value
        perspPos[0] = ndc[0] * perspPos[3];
        perspPos[1] = ndc[1] * perspPos[3];
        // Inverse-project to world space
        vec4.transformMat4(perspPos, perspPos,
          this.engine.systems.cameraMatrix.getProjectionInverse(camera));
        vec4.transformMat4(perspPos, perspPos,
          this.engine.systems.matrix.get(camera));
        // Tada
        pos = perspPos;
      }
      this.engine.actions.external.execute('editor.cursor', pos);
    }
    if (e.button !== 1) return;
    this.mouseHeld = true;
    // Determine if we should go clockwise or anticlockwise.
    let upLocal = vec3.create();
    let up = vec3.fromValues(0, 1, 0);
    vec3.transformQuat(upLocal, [0, 1, 0],
      this.getCamera().transform.rotation);
    let upDot = vec3.dot(up, upLocal);
    this.rotateDir = upDot >= 0 ? 1 : -1;
    e.preventDefault();
  }
  mouseup(e) {
    if (e.button === 2) this.rightHeld = false;
    if (e.button !== 1) return;
    this.mouseHeld = false;
    e.preventDefault();
  }
  keydown(e) {
    if (e.shiftKey) return;
    if (e.keyCode === 32) {
      this.engine.actions.external.execute('blenderController.lerpCenter',
        this.getCamera(), [0, 0, 0]);
    }
    // Persp - Ortho swap
    if (e.keyCode === 101 || e.keyCode === 53) {
      this.engine.actions.external.execute('blenderController.setCamera',
        this.getCamera(), this.getCamera().camera.type === 'ortho');
    }
    // Front
    if (e.keyCode === 97 || e.keyCode === 49) {
      quat.identity(tempQuat);
      if (e.ctrlKey) {
        quat.rotateY(tempQuat, tempQuat, Math.PI);
      }
      this.engine.actions.external.execute('blenderController.lerpRotation',
        this.getCamera(), tempQuat);
    }
    // Right
    if (e.keyCode === 99 || e.keyCode === 51) {
      quat.identity(tempQuat);
      quat.rotateY(tempQuat, tempQuat, Math.PI / 2);
      if (e.ctrlKey) {
        quat.rotateY(tempQuat, tempQuat, -Math.PI);
      }
      this.engine.actions.external.execute('blenderController.lerpRotation',
        this.getCamera(), tempQuat);
    }
    // Top
    if (e.keyCode === 103 || e.keyCode === 55) {
      quat.identity(tempQuat);
      quat.rotateX(tempQuat, tempQuat, -Math.PI / 2);
      if (e.ctrlKey) {
        quat.rotateX(tempQuat, tempQuat, Math.PI);
      }
      this.engine.actions.external.execute('blenderController.lerpRotation',
        this.getCamera(), tempQuat);
    }
    // Translate
    if (e.keyCode === 71) {
      let prevEntity = this.engine.state.entities[this.engine.state.global.
        selectedEntity];
      if (prevEntity == null) return;
      this.manager.push(new TranslateMode(prevEntity,
        toNDC(this.mouseX, this.mouseY, this.renderer)
      ));
    }
    // Scale
    if (e.keyCode === 83) {
      let prevEntity = this.engine.state.entities[this.engine.state.global.
        selectedEntity];
      if (prevEntity == null) return;
      this.manager.push(new ScaleMode(prevEntity,
        toNDC(this.mouseX, this.mouseY, this.renderer)
      ));
    }
    // Rotate
    if (e.keyCode === 82) {
      let prevEntity = this.engine.state.entities[this.engine.state.global.
        selectedEntity];
      if (prevEntity == null) return;
      this.manager.push(new RotateMode(prevEntity,
        toNDC(this.mouseX, this.mouseY, this.renderer)
      ));
    }
  }
  wheel(e) {
    let diff = e.deltaY / 50;
    if (e.deltaMode === 0) diff /= 12;
    if (e.shiftKey) {
      this.engine.actions.external.execute('blenderController.translate',
        this.getCamera(), 0, diff);
      e.preventDefault();
      return;
    } else if (e.ctrlKey) {
      this.engine.actions.external.execute('blenderController.translate',
        this.getCamera(), diff, 0);
      e.preventDefault();
      return;
    }
    this.engine.actions.external.execute('blenderController.zoom',
      this.getCamera(), diff);
    e.preventDefault();
  }
}
