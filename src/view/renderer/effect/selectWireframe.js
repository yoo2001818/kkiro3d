import wireframe from 'webglue/lib/geom/wireframe';

export default function selectWireframeEffect(renderer) {
  let wireframeGeoms = {};
  const engine = renderer.engine;
  const webglue = renderer.webglue;
  // TODO We should share this between effects...
  let colorShader = webglue.shaders.create(
    require('../../../shader/minimalBias.vert'),
    require('../../../shader/monoColor.frag')
  );
  return {
    colorShader, wireframeGeoms,
    entity: (data, entity) => {
      if (data == null) return;
      if (entity.transform == null) return data;
      if (entity.mesh == null) return data;
      let isSelectedAll = engine.systems.editor.isSelectedAll(entity);
      let isSelected = engine.systems.editor.isSelected(entity);
      if (!isSelectedAll) return data;
      let material = renderer.getSystem().materials[entity.mesh.material];
      if (material == null) return data;
      let geomName = entity.mesh.geometry;
      let geometry = wireframeGeoms[geomName];
      if (geometry == null) {
        if (renderer.getSystem().geometries[geomName] == null) return data;
        // TODO What if the geometry gets updated?
        geometry = wireframeGeoms[geomName] =
          webglue.geometries.create(
            wireframe(renderer.getSystem().geometries[geomName]));
      }
      return [data, {
        options: {
          widget: true
        },
        uniforms: {
          uColor: isSelected ? '#ffa400' : '#0084ff',
          uModel: engine.systems.matrix.get(entity),
          uBias: 0.001
        },
        shader: colorShader,
        geometry: geometry
      }];
    }
  };
}
