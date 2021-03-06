import createShaderHandler from '../../../util/createShaderHandler';

function packColor(id) {
  // Get R, G, B, A (using little endian)
  // Why do we use Float32Array? Because it's OpenGL.
  let output = new Float32Array(4);
  output[0] = (id & 0x7F) / 256;
  output[1] = ((id >>> 7) & 0x7F) / 256;
  output[2] = ((id >>> 14) & 0x7F) / 256;
  output[3] = ((id >>> 21) & 0x7F) / 256;
  return output;
}

function unpackColor(data) {
  let output = 0;
  output |= data[0];
  output |= data[1] << 7;
  output |= data[2] << 14;
  output |= data[3] << 21;
  return output;
}

export default function mousePickEffect(renderer) {
  // TODO We should share this between effects...
  const webglue = renderer.webglue;
  const gl = webglue.gl;
  // Create mouse pick framebuffer and shader
  let pickShaderHandler = createShaderHandler(
    require('../../../shader/monoColor.frag')
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
        clearColor: new Float32Array([0, 0, 0, 1]),
        clearDepth: 1,
        cull: gl.BACK,
        depth: gl.LEQUAL
      }),
      shaderHandler: pickShaderHandler,
      framebuffer: pickFramebuffer
    }),
    entity: (data, entity) => {
      if (data == null) return data;
      data.uniforms.uColor = packColor(entity.id);
      return data;
    },
    pick: function (x, y) {
      // Render mouse pick framebuffer.. (using itself as a filter)
      renderer.render(['mesh', 'generalHandle', 'mousePick']);
      // Then extract the pixel from framebuffer
      let pixel = new Uint8Array(4);
      pickFramebuffer.readPixelsRGBA((x - renderer.left),
        pickFramebuffer.height - (y - renderer.top), 1, 1, pixel);
      return unpackColor(pixel);
    }
  };
}
