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
    mesh: (data, entity) => {
      if (entity.id !== engine.state.global.selected) return data;
      let geomName = entity.mesh.geometry;
      let geometry = wireframeGeoms[geomName];
      if (geometry == null) {
        // TODO What if the geometry gets updated?
        geometry = wireframeGeoms[geomName] =
          webglue.geometries.create(wireframe(renderer.geometries[geomName]));
      }
      return Object.assign(data, {
        passes: [{
          uniforms: Object.assign({}, data.uniforms, {
            uColor: '#ffa400'
          }),
          shader: colorShaderHandler(data.shader, data.uniforms, webglue),
          geometry: geometry
        }, {}]
      });
    }
  };
}
