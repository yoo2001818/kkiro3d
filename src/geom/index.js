import box from 'webglue/lib/geom/box';
import channel from 'webglue/lib/geom/channel';
import translateWidget from 'webglue/lib/geom/translateWidget';
import calcNormals from 'webglue/lib/geom/calcNormals';
import loadOBJ from 'webglue/lib/loader/obj';

export default function createGeometries(renderer) {
  return {
    box: renderer.geometries.create(calcNormals(box())),
    teapot: renderer.geometries.create(channel(loadOBJ(
      require('./wt-teapot.obj')
    ))),
    translateWidget: renderer.geometries.create(translateWidget())
  };
}
