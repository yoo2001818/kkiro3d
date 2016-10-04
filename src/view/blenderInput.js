import { vec3, quat } from 'gl-matrix';

let tempQuat = quat.create();

export default class BlenderInput {
  constructor(engine, renderer, node, keyNode) {
    this.mouseHeld = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.rotateDir = 0;

    this.engine = engine;
    this.renderer = renderer;

    this.node = node;
    this.keyNode = keyNode;

    this.registerEvents();
  }
  getCamera() {
    return this.renderer.viewports[0].camera;
  }
  registerEvents() {
    this.node.addEventListener('mousemove', e => {
      if (!this.mouseHeld) return;
      let offsetX = e.clientX - this.mouseX;
      let offsetY = e.clientY - this.mouseY;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      if (e.shiftKey) {
        this.engine.actions.blenderController.translate(
          this.getCamera(), offsetX / 600, offsetY / 600);
        return;
      }
      this.engine.actions.blenderController.rotate(
        this.getCamera(), Math.PI / 180 * -offsetX * this.rotateDir / 4,
        Math.PI / 180 * -offsetY / 4);
    });
    this.node.addEventListener('contextmenu', e => {
      e.preventDefault();
    });
    this.node.addEventListener('mousedown', e => {
      if (e.button === 0) return;
      this.mouseHeld = true;
      // Determine if we should go clockwise or anticlockwise.
      let upLocal = vec3.create();
      let up = vec3.fromValues(0, 1, 0);
      vec3.transformQuat(upLocal, [0, 1, 0],
        this.getCamera().transform.rotation);
      let upDot = vec3.dot(up, upLocal);
      this.rotateDir = upDot >= 0 ? 1 : -1;
      // Set position
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      e.preventDefault();
    });
    this.node.addEventListener('mouseup', e => {
      if (e.button === 0) return;
      this.mouseHeld = false;
      e.preventDefault();
    });
    this.keyNode.addEventListener('keydown', e => {
      if (e.shiftKey) return;
      if (e.keyCode === 32) {
        this.engine.actions.blenderController.lerpCenter(
          this.getCamera(), [0, 0, 0]);
      }
      // Persp - Ortho swap
      if (e.keyCode === 101 || e.keyCode === 53) {
        this.engine.actions.blenderController.setCamera(
          this.getCamera(), this.getCamera().camera.type === 'ortho');
      }
      // Front
      if (e.keyCode === 97 || e.keyCode === 49) {
        quat.identity(tempQuat);
        if (e.ctrlKey) {
          quat.rotateY(tempQuat, tempQuat, Math.PI);
        }
        this.engine.actions.blenderController.lerpRotation(
          this.getCamera(), tempQuat);
      }
      // Right
      if (e.keyCode === 99 || e.keyCode === 51) {
        quat.identity(tempQuat);
        quat.rotateY(tempQuat, tempQuat, Math.PI / 2);
        if (e.ctrlKey) {
          quat.rotateY(tempQuat, tempQuat, -Math.PI);
        }
        this.engine.actions.blenderController.lerpRotation(
          this.getCamera(), tempQuat);
      }
      // Top
      if (e.keyCode === 103 || e.keyCode === 55) {
        quat.identity(tempQuat);
        quat.rotateX(tempQuat, tempQuat, -Math.PI / 2);
        if (e.ctrlKey) {
          quat.rotateX(tempQuat, tempQuat, Math.PI);
        }
        this.engine.actions.blenderController.lerpRotation(
          this.getCamera(), tempQuat);
      }
    });
    this.node.addEventListener('wheel', e => {
      let diff = e.deltaY / 50;
      if (e.deltaMode === 0) diff /= 12;
      if (e.shiftKey) {
        this.engine.actions.blenderController.translate(
          this.getCamera(), 0, diff);
        e.preventDefault();
        return;
      } else if (e.ctrlKey) {
        this.engine.actions.blenderController.translate(
          this.getCamera(), diff, 0);
        e.preventDefault();
        return;
      }
      this.engine.actions.blenderController.zoom(this.getCamera(), diff);
      e.preventDefault();
    });
  }
}
