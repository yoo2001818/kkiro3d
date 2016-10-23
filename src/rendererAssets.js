import box from 'webglue/lib/geom/box';
import channel from 'webglue/lib/geom/channel';
import translateWidget from 'webglue/lib/geom/translateWidget';
import calcNormals from 'webglue/lib/geom/calcNormals';
import loadOBJ from 'webglue/lib/loader/obj';

export default {
  geometries: {
    box: calcNormals(box()),
    teapot: channel(loadOBJ(require('./geom/wt-teapot.obj'))),
    translateWidget: translateWidget()
  },
  shaders: {
    phong: {
      vert: require('./shader/phong.vert'),
      frag: require('./shader/phong.frag')
    }
  },
  textures: {},
  materials: {
    test: {
      shader: 'phong',
      uniforms: {
        uMaterial: {
          ambient: '#aaaaaa',
          diffuse: '#aaaaaa',
          specular: '#444444',
          reflectivity: '#8c292929',
          shininess: 90
        }
      }
    }
  }
};
