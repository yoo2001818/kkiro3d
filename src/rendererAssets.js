import box from 'webglue/lib/geom/box';
import channel from 'webglue/lib/geom/channel';
import translateWidget from 'webglue/lib/geom/translateWidget';
import calcNormals from 'webglue/lib/geom/calcNormals';
import calcTangents from 'webglue/lib/geom/calcTangents';
import loadOBJ from 'webglue/lib/loader/obj';

export default {
  geometries: {
    box: calcTangents(calcNormals(box())),
    door1: channel(loadOBJ(require('./geom/door1.obj'))),
    door: channel(loadOBJ(require('./geom/door.obj'))),
    translateWidget: translateWidget()
  },
  shaders: {
    phong: {
      vert: require('./shader/phong.vert'),
      frag: require('./shader/phong.frag')
    }
  },
  textures: {
    '2': {
      source: require('./texture/2.png')
    }
  },
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
        },
        uDiffuseMap: '2'
      }
    },
    test2: {
      shader: 'phong',
      uniforms: {
        uMaterial: {
          ambient: '#ffffff',
          diffuse: '#999999',
          specular: '#222222',
          reflectivity: '#5352514F',
          shininess: 90
        }
      }
    }
  }
};
