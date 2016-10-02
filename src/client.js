import Renderer from 'webglue/lib/renderer';
import box from 'webglue/lib/geom/box';
import { Engine } from 'fudge';

import transform from './component/transform';
import light from './component/light';
import camera from './component/camera';
import mesh from './component/mesh';
import MatrixSystem from './system/matrix';
import CameraMatrixSystem from './system/cameraMatrix';
import RendererSystem from './system/renderer';

// Canvas init
let canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

window.addEventListener('resize', () => {
  canvas.width = document.documentElement.clientWidth;
  canvas.height = document.documentElement.clientHeight;
});

document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';

let gl = canvas.getContext('webgl', { antialias: true }) ||
  canvas.getContext('experimental-webgl');
let renderer = new Renderer(gl);

let engine = new Engine({
  transform, light, camera, mesh
}, {
  matrix: MatrixSystem,
  cameraMatrix: CameraMatrixSystem,
  renderer: new RendererSystem(renderer, {
    box: renderer.geometries.create(box())
  }, {
    test: renderer.shaders.create(
      require('./shader/minimal.vert'),
      require('./shader/monoColor.frag')
    )
  }, {
    test: {
      shader: 'test',
      uColor: '#ffffffff'
    }
  }),
  test: function TestSystem (engine) {
    this.entities = engine.systems.family.get('transform').entities;
    let camera;
    let box;
    this.hooks = {
      'external.start': () => {
        box = engine.actions.entity.create({
          transform: {},
          mesh: { geometry: 'box', material: 'test' }
        });
        camera = engine.actions.entity.create({
          transform: {
            position: [0, 0, 5]
          },
          camera: {}
        });
      },
      'external.update': (delta) => {
        engine.actions.transform.rotateY(box, delta);
        // engine.actions.transform.translate(box, [delta / 30, 0, 0]);
      }
    };
  }
});

engine.start();

let prevTime = -1;
// let timer = 0;

function update(time) {
  if (prevTime === -1) prevTime = time;
  let delta = (time - prevTime) / 1000;
  prevTime = time;
  // timer += delta;

  engine.update(delta);
  window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);
