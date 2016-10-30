// Sets up meshes for forward rendering
export default function meshEffect(renderer) {
  const engine = renderer.engine;
  const gl = renderer.webglue.gl;
  return {
    worldPre: (world) => {
      world.uniforms.uDirectionalLight = [];
      world.uniforms.uPointLight = [];
      return world;
    },
    entity: (data, entity) => {
      if (entity.transform == null) return data;
      if (entity.mesh == null || !entity.mesh.visible) return data;
      let material = renderer.getSystem().materials[entity.mesh.material];
      if (material == null) return data;
      let shader = renderer.getSystem().shaders[material.shader];
      return Object.assign({}, material, {
        options: entity.mesh.mirror && {
          // TODO Wouldn't it be a problem?
          cull: gl.FRONT
        },
        shader: shader,
        geometry: renderer.getSystem().geometries[entity.mesh.geometry],
        uniforms: Object.assign({}, material.uniforms, {
          uModel: engine.systems.matrix.get(entity),
          uNormal: engine.systems.matrix.getNormal(entity)
        })
      });
    }
  };
}
