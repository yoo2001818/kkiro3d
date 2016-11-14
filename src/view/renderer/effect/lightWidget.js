import circleLine from 'webglue/lib/geom/circleLine';
import combine from 'webglue/lib/geom/combine';
import transform from 'webglue/lib/geom/transform';

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
  let spotLine = webglue.geometries.create(combine([{
    attributes: { aPosition: [
      [0, 0, 0], [1, 0, 0], [1, 1, 0], [1, -1, 0], [1, 2, 0], [1, -2, 0]
    ] },
    indices: [0, 1, 0, 2, 0, 3, 0, 4, 0, 5],
    mode: gl.LINES
  }, transform(circleLine(24), {
    aPosition: [
      0, 0, 1, 0,
      0, 1, 0, 0,
      0, 0, 0, 0,
      1, 0, 0, 1
    ]
  }), transform(circleLine(24), {
    aPosition: [
      0, 0, 2, 0,
      0, 2, 0, 0,
      0, 0, 0, 0,
      1, 0, 0, 1
    ]
  })]));
  let spotLineShader = webglue.shaders.create(
    require('../../../shader/spotLine.vert'),
    require('../../../shader/monoColor.frag')
  );
  let pointLightShader = webglue.shaders.create(
    require('../../../shader/point.vert'),
    require('../../../shader/pointLight.frag')
  );
  let directionalLightShader = webglue.shaders.create(
    require('../../../shader/point.vert'),
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
      if (entity.transform == null) return data;
      if (entity.light == null) return data;
      let isSelectedAll = engine.systems.editor.isSelectedAll(entity);
      let isSelected = engine.systems.editor.isSelected(entity);
      let model = engine.systems.matrix.get(entity);
      let out;
      switch (entity.light.type) {
      case 'point':
        out = {
          options: {
            widget: true
          },
          uniforms: {
            uModel: model,
            uColor: isSelectedAll ? (
              isSelected ? '#ffa400' : '#0084ff'
            ) : '#000000'
          },
          passes: [{
            options: {
              widget: true
            },
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
        break;
      case 'directional':
        out = {
          options: {
            widget: true
          },
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
        break;
      case 'spot':
        out = {
          options: {
            widget: true
          },
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
          }, {
            uniforms: {
              uSize: [20,
                Math.tan(Math.acos(entity.light.angle[0])),
                Math.tan(Math.acos(entity.light.angle[1])),
              ]
            },
            shader: spotLineShader,
            geometry: spotLine
          }, getLinePass(model)]
        };
        break;
      }
      if (data == null) return out;
      return [data, out];
    }
  };
}
