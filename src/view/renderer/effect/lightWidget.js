function getLinePointerMatrix(entityMat) {
  let center = entityMat.subarray(12, 15);
  return [
    0, -center[1], 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    center[0], center[1], center[2], 1
  ];
}

export default function lightWidgetEffect(renderer) {
  const engine = renderer.engine;
  const webglue = renderer.webglue;
  const gl = webglue.gl;
  // Why do we need this :/
  let point = webglue.geometries.create({
    attributes: { aPosition: [[0, 0, 0]] },
    mode: gl.POINTS
  });
  let line = webglue.geometries.create({
    attributes: { aPosition: [[0, 0, 0], [1, 0, 0]] },
    mode: gl.LINES
  });
  let lineShader = webglue.shaders.create(
    require('../../../shader/minimal.vert'),
    require('../../../shader/monoColor.frag')
  );
  let dottedLine = webglue.geometries.create({
    attributes: { aPosition: [[0, 0, 0], [0, 0, -10]] },
    mode: gl.LINES
  });
  let dottedLineShader = webglue.shaders.create(
    require('../../../shader/dottedLine.vert'),
    require('../../../shader/dottedLine.frag')
  );
  let pointLightShader = webglue.shaders.create(
    require('../../../shader/light.vert'),
    require('../../../shader/pointLight.frag')
  );
  let directionalLightShader = webglue.shaders.create(
    require('../../../shader/light.vert'),
    require('../../../shader/directionalLight.frag')
  );
  function getLinePass(model) {
    return {
      options: {
        blend: {
          func: {
            rgb: [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA],
            alpha: [gl.ZERO, gl.ONE]
          }
        }
      },
      uniforms: {
        uModel: getLinePointerMatrix(model),
        uColor: '#55000000'
      },
      shader: lineShader,
      geometry: line
    };
  }
  return {
    pointLightShader,
    entity: (data, entity) => {
      if (entity.light == null) return data;
      let isSelected = entity.id === engine.state.global.selected;
      let model = engine.systems.matrix.get(entity);
      switch (entity.light.type) {
      case 'point':
        return {
          uniforms: {
            uModel: model,
            uColor: isSelected ? '#ffa400' : '#000000'
          },
          passes: [{
            uniforms: {
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
          }, getLinePass(model)]
        };
      case 'directional':
        return {
          uniforms: {
            uModel: model,
            uColor: isSelected ? '#ffa400' : '#000000'
          },
          passes: [{
            uniforms: {
              uWidth: 1.5/40,
              uFill: 6/40,
              uLine: 18/40,
              uCrossStart: 22/40,
              uRadius: 40,
              uResolution: shader =>
                [1 / shader.renderer.width, 1 / shader.renderer.height]
            },
            shader: directionalLightShader,
            geometry: point
          }, {
            uniforms: {
              uDotted: 0.1
            },
            shader: dottedLineShader,
            geometry: dottedLine
          }, getLinePass(model)]
        };
      }
    }
  };
}
