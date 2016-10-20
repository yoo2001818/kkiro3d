import createShaderHandler from '../../../util/createShaderHandler';
import toNDC from '../../../util/toNDC';
import { vec3, vec4 } from 'gl-matrix';

function decodeDepth(data) {
  let output = 0;
  // We're good with 24-bit depth (plus 8 bits for out of range stuff..)
  output += data[0] / 255;
  output += data[1] / 255 / 255;
  output += data[2] / 255 / 65025;
  output += data[3] / 255 / 16581375;
  return output;
}

function decodePos(data, x, y, inverseProjection, inverseView) {
  let depth = decodeDepth(data);
  if (depth > 1) return null;
  let projPos = vec4.fromValues(x, y, depth * 2 - 1, 1);
  vec4.transformMat4(projPos, projPos, inverseProjection);
  vec3.scale(projPos, projPos, 1 / projPos[3]);
  projPos[3] = 1;
  vec4.transformMat4(projPos, projPos, inverseView);
  return projPos;
}

export default function depthPickEffect(renderer) {
  // TODO We should share this between effects...
  const webglue = renderer.webglue;
  const gl = webglue.gl;
  // Create depth pick framebuffer and shader
  let pickShaderHandler = createShaderHandler(
    require('../../../shader/encodeDepth.frag')
  );
  let pickTexture = webglue.textures.create(null, {
    format: gl.RGBA
  });
  let pickFramebuffer = webglue.framebuffers.create({
    color: pickTexture,
    depth: gl.DEPTH_COMPONENT16 // Automatically use renderbuffer
  });
  return {
    pickFramebuffer,
    viewport: (data) => Object.assign(data, {
      options: Object.assign(data.options, {
        clearColor: new Float32Array([1, 1, 1, 1]),
        clearDepth: 1,
        cull: gl.BACK,
        depth: gl.LEQUAL
      }),
      shaderHandler: pickShaderHandler,
      framebuffer: pickFramebuffer
    }),
    pick: function (x, y) {
      // Render depth pick framebuffer.. (using itself as a filter)
      renderer.render([renderer.effects.mesh, renderer.effects.generalHandle,
        this]);
      // Then extract the pixel from framebuffer
      let pixel = new Uint8Array(4);
      pickFramebuffer.readPixelsRGBA(x,
        pickFramebuffer.height - y, 1, 1, pixel);
      let ndc = toNDC(x, y, renderer);
      let camera = renderer.viewports[0].camera;
      return decodePos(pixel, ndc[0], ndc[1],
        renderer.engine.systems.cameraMatrix.getProjectionInverse(camera),
        renderer.engine.systems.matrix.get(camera)
      );
    }
  };
}
