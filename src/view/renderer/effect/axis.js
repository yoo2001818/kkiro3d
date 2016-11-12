export default function axisEffect(renderer) {
  // TODO We should share this between effects...
  const engine = renderer.engine;
  const webglue = renderer.webglue;
  const gl = webglue.gl;
  let axisShader = webglue.shaders.create(
    require('../../../shader/minimal.vert'),
    require('../../../shader/monoColor.frag')
  );
  let axisGeom = webglue.geometries.create({
    attributes: {
      aPosition: [[-1, 0, 0], [1, 0, 0]]
    },
    mode: gl.LINES
  });
  let matrixSystem = engine.systems.matrix;
  return {
    direction: [1, 0, 0],
    color: '#ff0000',
    entity: function (data, entity) {
      if (engine.systems.editor.getSelf().selectedType !== 'entity') {
        return data;
      }
      if (entity.id !== engine.systems.editor.getSelf().selected) return data;
      if (this.direction == null) return data;
      let direction = this.direction;
      let position = matrixSystem.getPosition(entity);
      return [data, {
        uniforms: {
          uColor: this.color,
          uModel: [
            direction[0] * 1000, direction[1] * 1000, direction[2] * 1000, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            position[0],
            position[1],
            position[2],
            1
          ]
        },
        shader: axisShader,
        geometry: axisGeom
      }];
    }
  };
}
