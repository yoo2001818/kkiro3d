import translateWidgetGeom from 'webglue/lib/geom/translateWidget';
import { mat4 } from 'gl-matrix';

export default function selectWireframeEffect(renderer) {
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
  return {
    translateWidget, widgetShader,
    world: (data) => {
      // Add widget to draw passes if an entity is selected
      let entityId = engine.state.global.selected;
      let entity = engine.state.entities[entityId];
      if (entity == null) return data;
      // Create model matrix for it (Sigh)
      let model = mat4.create();
      model.set(entity.transform.position, 12);
      return Object.assign(data, {
        passes: (data.passes || [{}]).concat([{
          uniforms: {
            uModel: model
          },
          shader: widgetShader,
          geometry: translateWidget
        }])
      });
    }
  };
}
