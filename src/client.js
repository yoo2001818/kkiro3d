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

createView(engine);

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
}

window.requestAnimationFrame(update);
