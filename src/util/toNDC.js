export default function toNDC(x, y, renderer) {
  let gl = renderer.webglue.gl;
  let viewport = renderer.engine.systems.renderer.viewportList[0].viewport ||
    [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight];
  let offsetX = (x - renderer.left) - viewport[0];
  let offsetY = (gl.drawingBufferHeight - (y - renderer.top)) - viewport[1];
  return [offsetX / viewport[2] * 2 - 1, offsetY / viewport[3] * 2 - 1];
}
