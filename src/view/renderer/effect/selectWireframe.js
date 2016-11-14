import createShaderHandler from '../../../util/createShaderHandler';
import wireframe from 'webglue/lib/geom/wireframe';

export default function selectWireframeEffect(renderer) {
  // TODO We should share this between effects...
  let colorShaderHandler = createShaderHandler(
    require('../../../shader/monoColor.frag')
  );
  let wireframeGeoms = {};
  const engine = renderer.engine;
  const webglue = renderer.webglue;
  return {
    colorShaderHandler, wireframeGeoms,
    entity: (data, entity) => {
      if (data == null) return;
      if (entity.transform == null) return data;
      if (entity.mesh == null) return data;
      let isSelectedAll = engine.systems.editor.isSelectedAll(entity);
      let isSelected = engine.systems.editor.isSelected(entity);
      if (!isSelectedAll) return data;
      let geomName = entity.mesh.geometry;
      let geometry = wireframeGeoms[geomName];
      if (geometry == null) {
        if (renderer.getSystem().geometries[geomName] == null) return data;
        // TODO What if the geometry gets updated?
        geometry = wireframeGeoms[geomName] =
          webglue.geometries.create(
            wireframe(renderer.getSystem().geometries[geomName]));
      }
      if (data.passes == null) {
        data.passes = [{
          options: {
            polygonOffset: [1, 0]
          }
        }];
      }
      data.passes.push({
        options: {
          widget: true
        },
        uniforms: {
          uColor: isSelected ? '#ffa400' : '#0084ff'
        },
        shader: colorShaderHandler(data.shader, data.uniforms, webglue),
        geometry: geometry
      });
      return data;
    }
  };
}
