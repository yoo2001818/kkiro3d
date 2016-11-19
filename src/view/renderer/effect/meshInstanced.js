// Sets up meshes for forward rendering
export default function meshEffect(renderer) {
  const engine = renderer.engine;
  const webglue = renderer.webglue;
  const gl = renderer.webglue.gl;
  let family = engine.systems.family.get('mesh', 'transform');
  let cache = {};
  return {
    worldPre: (world) => {
      // TODO We have make it to external system or something
      // (This is only proof of concept, which is horribly slow)
      // Clear cache list
      for (let key in cache) {
        cache[key].list = [];
      }
      // Iterate all the entities and pre-build cache
      family.entities.forEach(entity => {
        if (!entity.mesh.visible) return;
        let material = renderer.getSystem().materials[entity.mesh.material];
        if (material == null) return;
        let shader = renderer.getSystem().shaders[material.shader];
        // Read the vertex shader - Does it support instancing?
        if (shader.instancing == null) {
          shader.instancing =
            shader.source.vert.indexOf('#define INSTANCING') !== -1;
        }
        // Bail out if it doesn't support instancing
        if (shader.instancing === false) return;
        // TODO Possibly cache this too
        let key = entity.mesh.geometry + '_' + entity.mesh.material;
        // Put everything to the cache
        if (cache[key] == null) {
          cache[key] = {
            buffer: null,
            geom: null,
            list: [],
            geometry: renderer.getSystem().geometries[entity.mesh.geometry],
            shader: renderer.getSystem().shaders[material.shader],
            material: material
          };
        }
        cache[key].list.push(engine.systems.matrix.get(entity));
      });
      // Update / create VBO
      for (let key in cache) {
        let entry = cache[key];
        if (entry.list.length > 2) {
          // Unwrap the list
          let unwrapped = new Float32Array(entry.list.length * 16);
          for (let i = 0; i < entry.list.length; ++i) {
            unwrapped.set(entry.list[i], i * 16);
          }
          if (entry.geom == null) {
            // Create VBO
            entry.buffer = webglue.geometries.createBuffer(unwrapped,
              gl.DYNAMIC_DRAW);
            // Can I do this? :(
            entry.geom = webglue.geometries.create(Object.assign({},
              entry.geometry, {
                attributes: Object.assign({}, entry.geometry.attributes, {
                  aInstanced1: {
                    buffer: entry.buffer,
                    offset: 0, axis: 4, stride: 4 * 4 * 4, instanced: 1
                  },
                  aInstanced2: {
                    buffer: entry.buffer,
                    offset: 4 * 4, axis: 4, stride: 4 * 4 * 4, instanced: 1
                  },
                  aInstanced3: {
                    buffer: entry.buffer,
                    offset: 2 * 4 * 4, axis: 4, stride: 4 * 4 * 4, instanced: 1
                  },
                  aInstanced4: {
                    buffer: entry.buffer,
                    offset: 3 * 4 * 4, axis: 4, stride: 4 * 4 * 4, instanced: 1
                  },
                })
              })
            );
          } else {
            // Update VBO
            entry.buffer.update(unwrapped);
            // Can I do this? :(
            entry.geom.update({
              attributes: {
                aInstanced1: {
                  buffer: entry.buffer,
                  offset: 0, axis: 4, stride: 4 * 4 * 4, instanced: 1
                },
                aInstanced2: {
                  buffer: entry.buffer,
                  offset: 4 * 4, axis: 4, stride: 4 * 4 * 4, instanced: 1
                },
                aInstanced3: {
                  buffer: entry.buffer,
                  offset: 2 * 4 * 4, axis: 4, stride: 4 * 4 * 4, instanced: 1
                },
                aInstanced4: {
                  buffer: entry.buffer,
                  offset: 3 * 4 * 4, axis: 4, stride: 4 * 4 * 4, instanced: 1
                },
              }
            });
          }
        } else {
          if (entry.geom != null) {
            // Dispose VBO and geometry
            entry.buffer.dispose();
            entry.buffer = null;
            entry.geom.dispose();
            entry.geom = null;
          }
        }
      }
      return world;
    },
    world: (world) => {
      for (let key in cache) {
        let entry = cache[key];
        if (entry.geom == null) continue;
        world.passes.push(Object.assign({}, entry.material, {
          uniforms: Object.assign({}, entry.material.uniforms, {
            uInstanced: 1
          }),
          geometry: entry.geom,
          shader: entry.shader
        }));
      }
      return world;
    },
    entity: (data, entity) => {
      if (data === false) return data;
      if (entity.transform == null) return data;
      if (entity.mesh == null || !entity.mesh.visible) return data;
      let material = renderer.getSystem().materials[entity.mesh.material];
      if (material == null) return data;
      let entry = cache[entity.mesh.geometry + '_' + entity.mesh.material];
      if (entry == null || entry.buffer == null) return null;
      return false;
    }
  };
}
