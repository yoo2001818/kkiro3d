import { vec3 } from 'gl-matrix';

export default function collisionEffect(renderer) {
  const engine = renderer.engine;
  const webglue = renderer.webglue;
  const gl = webglue.gl;
  // What the heck, we only have AABB yet
  let box = webglue.geometries.create({
    attributes: { aPosition: [
      [1, 1, 1], [-1, 1, 1],
      [1, 1, -1], [-1, 1, -1],
      [1, -1, 1], [-1, -1, 1],
      [1, -1, -1], [-1, -1, -1]
    ] },
    indices: [
      0, 1, 1, 3, 3, 2, 2, 0,
      4, 5, 5, 7, 7, 6, 6, 4,
      0, 4, 1, 5, 3, 7, 2, 6
    ],
    mode: gl.LINES
  });
  let boxShader = webglue.shaders.create(
    require('../../../shader/minimal.vert'),
    require('../../../shader/monoColor.frag')
  );
  return {
    boxShader,
    entity: (data, entity) => {
      if (entity.transform == null) return data;
      if (entity.collision == null) return data;
      let isSelected = engine.state.global.selectedType === 'entity' &&
        entity.id === engine.state.global.selected;
      if (!isSelected) return data;
      let model = engine.systems.matrix.get(entity);
      // Calculate boundary matrix..
      let tmp = vec3.create();
      // We only have AABBs for now. :P
      let min = vec3.fromValues(Infinity, Infinity, Infinity);
      let max = vec3.fromValues(-Infinity, -Infinity, -Infinity);
      // What the heck
      for (let x = -1; x <= 1; x += 2) {
        for (let y = -1; y <= 1; y += 2) {
          for (let z = -1; z <= 1; z += 2) {
            tmp[0] = x * entity.collision.size[0] + entity.collision.center[0];
            tmp[1] = y * entity.collision.size[1] + entity.collision.center[1];
            tmp[2] = z * entity.collision.size[2] + entity.collision.center[2];
            vec3.transformMat4(tmp, tmp, model);
            vec3.min(min, min, tmp);
            vec3.max(max, max, tmp);
          }
        }
      }
      // Then, create the matrix
      let matrix = [
        (max[0] - min[0]) / 2, 0, 0, 0,
        0, (max[1] - min[1]) / 2, 0, 0,
        0, 0, (max[2] - min[2]) / 2, 0,
        (max[0] + min[0]) / 2, (max[1] + min[1]) / 2, (max[2] + min[2]) / 2, 1
      ];
      if (data == null) data = {};
      data.passes = (data.passes || [{}]).concat({
        options: {
          polygonOffset: [2, 0]
        },
        uniforms: {
          uModel: matrix,
          uColor: '#6FFF93'
        },
        shader: boxShader,
        geometry: box
      });
      return data;
    }
  };
}
