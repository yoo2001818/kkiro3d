export default function cameraWidgetEffect(renderer) {
  const engine = renderer.engine;
  const webglue = renderer.webglue;
  const gl = webglue.gl;
  // Why do we need this :/
  let coneGeom = webglue.geometries.create({
    attributes: {
      aPosition: {
        axis: 3,
        data: new Float32Array([
          0, 0, 0,
          -1, -1, 1,
          1, -1, 1,
          1, 1, 1,
          -1, 1, 1,
          0.8, 1.1, 1,
          -0.8, 1.1, 1,
          0, 1.5, 1,
        ])
      }
    },
    indices: [
      0, 1, 0, 2, 0, 3, 0, 4,
      1, 2, 2, 3, 3, 4, 4, 1,
      5, 6, 6, 7, 7, 5
    ],
    mode: gl.LINES
  });
  let lineShader = webglue.shaders.create(
    require('../../../shader/cameraWidget.vert'),
    require('../../../shader/monoColor.frag')
  );
  return {
    entity: (data, entity) => {
      if (entity.camera == null) return data;
      let isSelectedAll = engine.systems.editor.isSelectedAll(entity);
      let isSelected = engine.systems.editor.isSelected(entity);
      let isCamera = engine.systems.editor.isCamera(entity);
      let model = engine.systems.matrix.get(entity);
      let aspect = engine.systems.cameraMatrix.getCurrentAspect(entity);
      let scale = [1, 1, 1];
      if (entity.camera.type === 'persp') {
        scale[0] = aspect;
        scale[2] = -1 / Math.tan(entity.camera.fov / 2);
      } else {
        scale[0] = entity.camera.zoom * aspect;
        scale[1] = entity.camera.zoom;
        scale[2] = -1;
      }
      let out = (tree) => {
        return tree.getOption('camera') === entity ? null : {
          options: {
            widget: true
          },
          uniforms: {
            uModel: model,
            uColor: isSelectedAll ? (
              isSelected ? '#ffa400' : '#0084ff'
            ) : (
              isCamera ? '#00ff0a' :'#000000'
            ),
            uScale: scale
          },
          shader: lineShader,
          geometry: coneGeom
        };
      };
      if (data == null) return out;
      return [data, out];
    }
  };
}
