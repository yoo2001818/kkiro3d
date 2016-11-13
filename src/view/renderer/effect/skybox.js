import box from 'webglue/lib/geom/box';

// Sets up environment map and skybox
export default function skyboxEffect(renderer) {
  const webglue = renderer.webglue;
  const gl = webglue.gl;
  let skyboxShader = webglue.shaders.create(
    require('../../../shader/skybox.vert'),
    require('../../../shader/skybox.frag')
  );
  let boxGeom = webglue.geometries.create(box());
  return {
    entity: (data, entity, world, passes) => {
      if (entity.skybox == null) return data;
      // Too easy. maybe? :/
      world.uniforms.uEnvironmentMap = entity.skybox.texture;
      passes.world.push({
        options: {
          cull: gl.FRONT
        },
        shader: skyboxShader,
        geometry: boxGeom,
        uniforms: {
          uSkybox: entity.skybox.texture
        }
      });
      return data;
    }
  };
}
