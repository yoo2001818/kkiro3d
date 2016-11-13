import createShaderHandler from '../../../util/createShaderHandler';
import Filter from 'webglue/lib/filter';

// Bakes shadow maps with VSM, blur and stuff
export default function lightShadowEffect(renderer) {
  const engine = renderer.engine;
  const webglue = renderer.webglue;
  const gl = webglue.gl;
  let cameraMatrix = engine.systems.cameraMatrix;
  let shadowShaderHandler = createShaderHandler(
    require('../../../shader/shadow.frag')
  );
  let fxaaFilter = new Filter(webglue,
    require('../../../shader/fxaaShadow.frag'), {
      uTextureOffset: [1/256, 1/256]
    });
  let blurFilter = new Filter(webglue,
    require('../../../shader/blurShadow.frag'), {
      uTextureOffset: [1/256, 1/256]
    });
  // This assumes that every shadow map's resolution is same
  // TODO Support other resolution
  let shadowMapOptions = {
    width: 256,
    height: 256,
    format: gl.RGBA,
    type: gl.UNSIGNED_BYTE,
    params: {
      minFilter: gl.LINEAR, // Why
      mipmap: false
    }
  };
  let tempTexture = webglue.textures.create(null, shadowMapOptions);
  let shadowFramebuffer = webglue.framebuffers.create({
    color: tempTexture,
    depth: gl.DEPTH_COMPONENT16 // Automatically use renderbuffer
  });
  // TODO Currently textures are not garbage-collected!!!! It should.
  let textures = [];
  return {
    textures,
    entity: (data, entity, world, passes) => {
      if (entity.transform == null) return data;
      if (entity.light == null) return data;
      if (!entity.light.shadow) return data;
      if (entity.camera == null) return data;
      if (textures[entity.id] == null) {
        textures[entity.id] = webglue.textures.create(null, shadowMapOptions);
      }
      let texture = textures[entity.id];
      // Then we add viewport passes BEFORE the main rendering pass
      // (Shadow maps must be baked before rendering to screen)
      passes.viewport.unshift([
        // Pass 1: Draw the world (without any other fancy stuff)
        {
          options: {
            clearColor: '#ffffff',
            clearDepth: 1,
            cull: gl.BACK,
            depth: gl.LEQUAL,
            camera: entity
          },
          framebuffer: { color: texture, framebuffer: shadowFramebuffer },
          shaderHandler: shadowShaderHandler,
          uniforms: {
            uView: cameraMatrix.getView(entity),
            uProjection: cameraMatrix.getProjection.bind(cameraMatrix,
              entity),
            uProjectionView: cameraMatrix.getProjectionView.bind(cameraMatrix,
              entity)
          },
          passes: world
        },
        // Pass 2: Run FXAA
        fxaaFilter.get(texture, tempTexture),
        // Pass 3: Run Blur
        blurFilter.get(tempTexture, texture)
        // All done! It'd be usable by other shaders.
      ]);
    }
  };
}
