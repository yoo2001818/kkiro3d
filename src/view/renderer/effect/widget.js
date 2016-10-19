import translateWidgetGeom from 'webglue/lib/geom/translateWidget';
import { mat4 } from 'gl-matrix';

export default function widgetEffect(renderer) {
  const engine = renderer.engine;
  const webglue = renderer.webglue;
  const gl = webglue.gl;
  let translateWidget = webglue.geometries.create(translateWidgetGeom());
  // Why do we need this :/
  let point = webglue.geometries.create({
    attributes: { aPosition: [[0, 0, 0]] },
    mode: gl.POINTS
  });
  let widgetShader = webglue.shaders.create(
    require('../../../shader/widget.vert'),
    require('../../../shader/staticColor.frag')
  );
  let anchorShader = webglue.shaders.create(
    require('../../../shader/anchorPoint.vert'),
    require('../../../shader/anchorPoint.frag')
  );
  return {
    translateWidget, widgetShader,
    world: (data) => {
      // Add widget to draw passes if an entity is selected
      let entityId = engine.state.global.selected;
      let entity = engine.state.entities[entityId];
      if (entity != null && entity.transform != null) {
        // Create model matrix for it (Sigh)
        let model = mat4.create();
        model.set(entity.transform.position, 12);
        data.passes.push({
          uniforms: {
            uModel: model
          },
          shader: widgetShader,
          geometry: translateWidget
        });
      }
      // Or.. cursors.
      let cursor = engine.state.global.cursor;
      if (cursor != null) {
        // Create model matrix for it too
        let model = mat4.create();
        model.set(cursor, 12);
        data.passes.push({
          uniforms: {
            uModel: model,
            uCross: '#000000',
            uBorder1: '#ff0000',
            uBorder2: '#ffffff',
            uCrossWidth: 1/40,
            uCrossSize: 40,
            uCrossStart: 10/40,
            uRadius: 20/40,
            uBorderWidth: 1/40,
            uResolution: shader =>
              [1 / shader.renderer.width, 1 / shader.renderer.height]
          },
          shader: anchorShader,
          geometry: point
        });
      }
      return data;
    }
  };
}
