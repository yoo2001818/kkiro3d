export default function generalHandleEffect(renderer) {
  const engine = renderer.engine;
  const webglue = renderer.webglue;
  const gl = webglue.gl;
  // Why do we need this :/
  let point = webglue.geometries.create({
    attributes: { aPosition: [[0, 0, 0]] },
    mode: gl.POINTS
  });
  let pointShader = webglue.shaders.create(
    require('../../../shader/point.vert'),
    require('../../../shader/handle.frag')
  );
  return {
    pointShader,
    entity: (data, entity) => {
      if (data != null) return data;
      if (entity.transform == null) return data;
      let selfData = engine.systems.editor.getSelf();
      let isSelected = selfData.selectedType === 'entity' &&
        entity.id === selfData.selected;
      let model = engine.systems.matrix.get(entity);
      return {
        options: {
          widget: true
        },
        uniforms: {
          uModel: model,
          uColor: isSelected ? '#ffa400' : '#000000',
          uResolution: shader =>
            [1 / shader.renderer.width, 1 / shader.renderer.height],
          uRadius: 12
        },
        shader: pointShader,
        geometry: point
      };
    }
  };
}
