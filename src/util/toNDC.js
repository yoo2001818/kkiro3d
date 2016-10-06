export default function toNDC(x, y, renderer) {
  let gl = renderer.webglue.gl;
  let width = gl.drawingBufferWidth;
  let height = gl.drawingBufferHeight;
  return [x / width * 2 - 1, 1 - (y / height * 2)];
}
