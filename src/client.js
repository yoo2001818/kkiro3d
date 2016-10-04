import Renderer from 'webglue/lib/renderer';
import box from 'webglue/lib/geom/box';
import channel from 'webglue/lib/geom/channel';
import translateWidget from 'webglue/lib/geom/translateWidget';
import calcNormals from 'webglue/lib/geom/calcNormals';
import loadOBJ from 'webglue/lib/loader/obj';

import createEngine from './engine';

import RendererView from './view/renderer';
import BlenderInputView from './view/blenderInput';
import SelectView from './view/select';

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

let engine = createEngine({}, {
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
          mesh: { geometry: 'teapot', material: 'test' }
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

let rendererView = new RendererView(engine, renderer, {
  box: renderer.geometries.create(calcNormals(box())),
  teapot: renderer.geometries.create(channel(loadOBJ(
    require('./geom/wt-teapot.obj')
  ))),
  translateWidget: renderer.geometries.create(translateWidget())
}, {
  phong: renderer.shaders.create(
    require('./shader/phong.vert'),
    require('./shader/phong.frag')
  ),
  border: renderer.shaders.create(
    require('./shader/minimal.vert'),
    require('./shader/monoColor.frag')
  ),
  widget: renderer.shaders.create(
    require('./shader/widget.vert'),
    require('./shader/staticColor.frag')
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
  },
  widget: {
    shader: 'widget',
    options: {
      depth: gl.ALWAYS
    }
  }
});
let blenderInputView = new BlenderInputView(engine,
  rendererView, canvas, document);
let selectView = new SelectView(engine, rendererView);

canvas.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  selectView.selectPos(e.clientX, e.clientY);
});

let prevTime = -1;
// let timer = 0;

engine.start();

function update(time) {
  if (prevTime === -1) prevTime = time;
  let delta = (time - prevTime) / 1000;
  prevTime = time;
  // timer += delta;

  engine.update(delta);
  window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);
