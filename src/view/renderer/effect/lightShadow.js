import createShaderHandler from '../../../util/createShaderHandler';
import Filter from 'webglue/lib/filter';

// Bakes shadow maps with VSM, blur and stuff
export default function lightShadowEffect(renderer) {
  const engine = renderer.engine;
  const webglue = renderer.webglue;
  const gl = webglue.gl;
  let cameraMatrix = engine.systems.cameraMatrix;
  let shadowShaderHandlerRaw = createShaderHandler(
    require('../../../shader/shadow.frag')
  );
  let shadowShaderHandler = (shader, node, renderer) => {
    if (node.getOption('widget')) return null;
    return shadowShaderHandlerRaw(shader, node, renderer);
  };
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
      minFilter: gl.LINEAR,
      mipmap: false
    }
  };
  let tempTexture = webglue.textures.create(null, shadowMapOptions);
  let shadowFramebuffer = webglue.framebuffers.create({
    color: tempTexture,
    depth: gl.DEPTH_COMPONENT16 // Automatically use renderbuffer
  });
  let textures = [];
  let lightShadow = {
    textures,
    count: 0,
    worldPre: (world) => {
      lightShadow.count = 0;
      return world;
    },
    entity: (data, entity, world, passes) => {
      if (entity.transform == null) return data;
      if (entity.light == null) return data;
      if (!entity.light.shadow) return data;
      if (entity.camera == null) return data;
      if (textures[lightShadow.count] == null) {
        textures.push(webglue.textures.create(null, shadowMapOptions));
      }
      let texture = textures[lightShadow.count];
      lightShadow.count ++;
      // Then we add viewport passes BEFORE the main rendering pass
      // (Shadow maps must be baked before rendering to screen)
      passes.viewport.unshift([
        // Pass 1: Draw the world (without any other fancy stuff)
        {
          options: {
            clearColor: [1, 0, 1, 0],
            clearDepth: 1,
            cull: gl.BACK,
            depth: gl.LEQUAL,
            camera: entity
          },
          framebuffer: { color: texture, framebuffer: shadowFramebuffer },
          shaderHandler: shadowShaderHandler,
          uniforms: {
            uView: cameraMatrix.getView(entity),
            uProjection: entity.camera.aspect === 0 ?
              cameraMatrix.getProjection.bind(cameraMatrix, entity) :
              cameraMatrix.getProjection(entity, entity.camera.aspect),
            uProjectionView: entity.camera.aspect === 0 ?
              cameraMatrix.getProjectionView.bind(cameraMatrix, entity) :
              cameraMatrix.getProjectionView(entity, entity.camera.aspect),
            uRange: [entity.camera.near, entity.camera.far]
          },
          passes: world
        },
        // Pass 2: Run FXAA
        fxaaFilter.get(texture, tempTexture),
        // Pass 3: Run Blur
        blurFilter.get(tempTexture, texture)
        // All done! It'd be usable by other shaders.
      ]);
    },
    world: (data) => {
      // Clean up unused textures
      for (let i = textures.length - 1; i >= lightShadow.count; --i) {
        textures[i].dispose();
        textures.pop();
      }
      return data;
    }
  };
  return lightShadow;
}
