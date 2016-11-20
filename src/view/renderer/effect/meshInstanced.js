// Sets up meshes for forward rendering
export default function meshEffect(renderer) {
  const engine = renderer.engine;
  const webglue = renderer.webglue;
  const gl = renderer.webglue.gl;
  let cache = {};
  let entityCache = [];
  function handleAdd(entity) {
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
    let geometry = renderer.getSystem().geometries[entity.mesh.geometry];
    if (geometry == null) return;
    let mirror = entity.mesh.mirror ? 'F' : 'B';
    let key = mirror + entity.mesh.geometry + '_' + entity.mesh.material;
    if (cache[key] == null) {
      cache[key] = {
        buffer: null,
        geom: null,
        list: [],
        invalid: true,
        mirror: entity.mesh.mirror,
        invalidList: [],
        geometry: geometry,
        shader: renderer.getSystem().shaders[material.shader],
        material: material
      };
    }
    entityCache[entity.id] = key;
    cache[key].list.push(entity);
    // Do complete reupload
    cache[key].invalid = true;
  }
  function handleRemove(entity) {
    let keyEntry = entityCache[entity.id];
    if (keyEntry == null) return;
    let entry = cache[keyEntry];
    if (entry == null) return;
    let offset = entry.list.indexOf(entity);
    if (offset !== -1) {
      entry.list.splice(offset, 1);
    }
    entry.invalid = true;
    if (entry.list.length === 0) {
      // Dispose
      entry.buffer.dispose();
      entry.geom.dispose();
      delete cache[keyEntry];
    }
    entityCache[entity.id] = null;
  }
  function propagateUpdate(id) {
    let childrens = engine.systems.parent.childrens[id];
    let key = entityCache[id];
    let entry = cache[key];
    if (entry != null) {
      if (entry.invalidList.indexOf(id) === -1) {
        entry.invalidList.push(id);
      }
    }
    if (childrens == null) return;
    childrens.forEach(e => propagateUpdate(e));
  }
  let family = engine.systems.family.get('mesh', 'transform');
  family.onAdd.add(handleAdd);
  family.onRemove.add(handleRemove);
  engine.attachHook('external.load!', () => {
    // Remove ALL data (Start everything again)
    for (let key in cache) {
      let entry = cache[key];
      if (entry.geom != null) {
        entry.geom.dispose();
        entry.buffer.dispose();
      }
    }
    cache = {};
  });
  engine.attachHook('mesh.*:post!', ([entity]) => {
    handleRemove(entity);
    if (entity.mesh.visible) handleAdd(entity);
  });
  engine.attachHook('transform.*!', ([entity]) => {
    propagateUpdate(entity.id);
  });
  engine.attachHook('parent.*!', ([entity]) => {
    propagateUpdate(entity.id);
  });
  return {
    worldPre: (world) => {
      // Update / create VBO
      for (let key in cache) {
        let entry = cache[key];
        if (entry.invalid) {
          if (entry.list.length < 2 && entry.geom == null) continue;
          entry.invalidList = [];
          // Unwrap the list
          let unwrapped = new Float32Array(entry.list.length * 16);
          for (let i = 0; i < entry.list.length; ++i) {
            let entity = entry.list[i];
            unwrapped.set(engine.systems.matrix.get(entity), i * 16);
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
          entry.invalid = false;
          continue;
        }
        while (entry.invalidList.length > 0) {
          let entityId = entry.invalidList.pop();
          let entity = engine.state.entities[entityId];
          if (entity == null) continue;
          let mat = engine.systems.matrix.get(entity);
          let index = entry.list.indexOf(entity);
          if (index === -1) continue;
          entry.buffer.updateSub(mat, index * 16);
        }
      }
      return world;
    },
    world: (world) => {
      for (let key in cache) {
        let entry = cache[key];
        if (entry.geom == null) continue;
        world.passes.push(Object.assign({}, entry.material, {
          options: entry.mirror && {
            // TODO Wouldn't it be a problem?
            cull: gl.FRONT
          },
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
      let entry = cache[entityCache[entity.id]];
      if (entry == null || entry.buffer == null) return null;
      return false;
    }
  };
}
