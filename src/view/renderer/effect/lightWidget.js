import { mat4 } from 'gl-matrix';

export default function lightWidgetEffect(renderer) {
  const engine = renderer.engine;
  const webglue = renderer.webglue;
  const gl = webglue.gl;
  // Why do we need this :/
  let point = webglue.geometries.create({
    attributes: { aPosition: [[0, 0, 0]] },
    mode: gl.POINTS
  });
  let pointLightShader = webglue.shaders.create(
    require('../../../shader/light.vert'),
    require('../../../shader/pointLight.frag')
  );
  return {
    pointLightShader,
    light: (entity, world) => {
      let isSelected = entity.id === engine.state.global.selected;
      let model = engine.systems.matrix.get(entity);
      switch (entity.light.type) {
      case 'point':
        world.passes.push({
          uniforms: {
            uModel: model,
            uColor: isSelected ? '#ffa400' : '#000000',
            uWidth: 1.1/25,
            uFill: 6/25,
            uLine1: 18/25,
            uLine2: 25/25,
            uRadius: 25,
            uResolution: shader =>
              [1 / shader.renderer.width, 1 / shader.renderer.height]
          },
          shader: pointLightShader,
          geometry: point
        });
        break;
      case 'directional':

        break;
      }
    }
  };
}
