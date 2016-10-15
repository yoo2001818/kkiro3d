import './style/index.scss';

import createView from './view';
import createEngine from './engine';
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
          mesh: { geometry: 'box', material: 'test' }
        });
        engine.actions.entity.create({
          name: 'Teapot',
          transform: {
            position: [3, 0, 0]
          },
          mesh: { geometry: 'teapot', material: 'test' }
        });
        camera = engine.actions.entity.create({
          name: 'Camera',
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

createView(engine);

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

  engine.update(delta);
  domCounter += 1;
  if (domCounter % 3 === 0) engine.actions.external.domUpdate(delta);
}

window.requestAnimationFrame(update);
