import Renderer from 'webglue/lib/renderer';
import box from 'webglue/lib/geom/box';
import calcNormals from 'webglue/lib/geom/calcNormals';
import { Engine } from 'fudge';

import transform from './component/transform';
import light from './component/light';
import camera from './component/camera';
import mesh from './component/mesh';
import blenderController from './component/blenderController';
import MatrixSystem from './system/matrix';
import CameraMatrixSystem from './system/cameraMatrix';
import BlenderControllerSystem from './system/blenderController';
import RendererSystem from './system/renderer';
import MousePickSystem from './system/mousePick';

import BlenderInput from './blenderInput';

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
  transform, light, camera, mesh, blenderController
}, {
  matrix: MatrixSystem,
  cameraMatrix: CameraMatrixSystem,
  blenderController: BlenderControllerSystem,
  renderer: new RendererSystem(renderer, {
    box: renderer.geometries.create(calcNormals(box()))
  }, {
    phong: renderer.shaders.create(
      require('./shader/phong.vert'),
      require('./shader/phong.frag')
    ),
    border: renderer.shaders.create(
      require('./shader/minimalBias.vert'),
      require('./shader/monoColor.frag')
    )
  }, {
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
  }),
  mousePick: MousePickSystem,
  test: function TestSystem (engine) {
    this.entities = engine.systems.family.get('transform').entities;
    let camera;
    let box;
    this.hooks = {
      'external.start!': () => {
        box = engine.actions.entity.create({
          transform: {},
          mesh: { geometry: 'box', material: 'test' }
        });
        engine.actions.entity.create({
          transform: {
            position: [3, 0, 0]
          },
          mesh: { geometry: 'box', material: 'test' }
        });
        camera = engine.actions.entity.create({
          transform: {
            position: [0, 0, 5]
          },
          camera: {},
          blenderController: {}
        });
      },
      'external.update!': ([delta]) => {
        engine.actions.transform.rotateY(box, delta);
        // engine.actions.transform.translate(box, [delta / 30, 0, 0]);
      }
    };
  }
});

engine.start();

let blenderInput = new BlenderInput(canvas, document, engine);

canvas.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  engine.systems.mousePick.pick(e.clientX, e.clientY);
});

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
