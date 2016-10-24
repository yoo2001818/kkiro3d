import './style/index.scss';

import rendererAssets from './rendererAssets';

import createView from './view';
import createEngine from './engine';
import RendererSystem from './system/renderer';
import BatteryManager from './util/batteryManager';

let engine = createEngine({}, {
  test: function TestSystem (engine) {
    this.entities = engine.systems.family.get('transform').entities;
    let camera;
    let box;
    this.hooks = {
      'external.start!': () => {
        box = engine.actions.entity.create({
          name: 'Box',
          transform: {},
          mesh: { geometry: 'box', material: 'test2' }
        });
        engine.actions.entity.create({
          name: 'Teapot',
          transform: {
            position: [3, 0, 0]
          },
          mesh: { geometry: 'teapot', material: 'test' }
        });
        engine.actions.entity.create({
          name: 'Camera',
          transform: {
            position: [0, 0, 5]
          },
          camera: {},
          blenderController: {}
        });
        let light = engine.actions.entity.create({
          name: 'Light',
          transform: {
            position: [2, 2, 2]
          },
          light: {
            type: 'directional',
            color: '#ffffff',
            ambient: 0.3,
            diffuse: 1.0,
            specular: 1.0
          }
        });
        engine.actions.transform.lookAtPos(light, [0, 0, 0], [0, 1, 0]);
        engine.actions.entity.create({
          name: 'PointLight',
          transform: {
            position: [-2, 0, 0]
          },
          light: {
            type: 'point',
            color: '#ff0000',
            ambient: 0.3,
            diffuse: 1.0,
            specular: 1.0,
            attenuation: 0.8
          }
        });
      },
      'external.update!': ([delta]) => {
        engine.actions.transform.rotateY(box, delta);
        // engine.actions.transform.translate(box, [delta / 30, 0, 0]);
      }
    };
  }
});

let renderer = createView(engine);
engine.addSystem('renderer', new RendererSystem(renderer, rendererAssets,
  ['mesh', 'light', 'selectWireframe', 'widget',
    'lightWidget', 'cameraWidget', 'generalHandle']));

let domCounter = 0;
let prevTime = -1;
let stepCounter = 0;
let battery = new BatteryManager();
// let timer = 0;

engine.start();

function update(time) {
  stepCounter = (stepCounter + 1) % battery.mode;
  window.requestAnimationFrame(update);
  if (stepCounter !== 0 && battery.mode !== 0) return;
  if (prevTime === -1) prevTime = time;
  let delta = (time - prevTime) / 1000;
  prevTime = time;
  // timer += delta;

  if (engine.state.global.running) engine.actions.external.update(delta);
  engine.actions.external.render(delta);
  domCounter += 1;
  if (domCounter % 3 === 0) engine.actions.external.domRender(delta);
}

window.requestAnimationFrame(update);
