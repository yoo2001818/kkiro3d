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
          -10, -10, 10,
          10, -10, 10,
          10, 10, 10,
          -10, 10, 10
        ])
      }
    },
    indices: [
      0, 1, 0, 2, 0, 3, 0, 4,
      1, 2, 2, 3, 3, 4, 4, 1,
      5, 6, 6, 7, 7, 5,
      8, 9, 9, 10, 10, 11, 8, 11,
      1, 8, 2, 9, 3, 10, 4, 11
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
      let scaleBig = [0, 0, 0];
      if (entity.camera.type === 'persp') {
        let fovLen = Math.tan(entity.camera.fov / 2);
        if (isSelected) {
          scaleBig[0] = aspect * entity.camera.far * fovLen;
          scaleBig[1] = entity.camera.far * fovLen;
          scaleBig[2] = -entity.camera.far;
          scale[0] = aspect * entity.camera.near * fovLen;
          scale[1] = entity.camera.near * fovLen;
          scale[2] = -entity.camera.near;
        } else {
          scale[0] = aspect * 1 * fovLen;
          scale[1] = 1 * fovLen;
          scale[2] = -1;
        }
      } else {
        if (isSelected) {
          scaleBig[0] = entity.camera.zoom * aspect;
          scaleBig[1] = entity.camera.zoom;
          scaleBig[2] = -entity.camera.far;
          scale[0] = entity.camera.zoom * aspect;
          scale[1] = entity.camera.zoom;
          scale[2] = -entity.camera.near;
        } else {
          scale[0] = 1 * aspect;
          scale[1] = 1;
          scale[2] = -1;
        }
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
            uScale: scale,
            uScaleBig: scaleBig
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
