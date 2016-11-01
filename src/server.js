import { WebSocketServerConnector } from 'locksmith-connector-ws';
import { HostSynchronizer } from 'locksmith';
import jsonReplacer from './util/jsonReplacer';

import createEngine from './engine';
import CollisionPushSystem from './system/collisionPush';
let engine = createEngine({}, {
  test: function TestSystem (engine) {
    this.entities = engine.systems.family.get('transform').entities;
    this.init = () => {
      engine.actions.entity.create({
        name: 'Box',
        transform: {},
        mesh: { geometry: 'box', material: 'test2' }
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
          position: [3, 4, 2]
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
    };
  }
});
engine.addSystem('collisionPush', CollisionPushSystem);

let machine = {
  getState() {
    return engine.getState();
  },
  loadState(state) {
    engine.stop();
    engine.actions.external.load(state);
    engine.start();
  },
  run(action) {
    // Remap arg
    console.log(action);
    let args = action.args.map(v => {
      if (v != null && v.__entity != null) {
        return engine.state.entities[v.__entity];
      }
      return v;
    });
    engine.actions.external.executeLocal.raw(args);
  }
};

let connector = new WebSocketServerConnector({
  port: 23482
});
connector.replacer = jsonReplacer;

let synchronizer = new HostSynchronizer(machine, connector, {
  dynamic: false,
  dynamicPushWait: 10,
  dynamicTickWait: 10,
  fixedTick: 50,
  fixedBuffer: 0,
  disconnectWait: 10000,
  freezeWait: 1000
});
connector.synchronizer = synchronizer;

engine.addSystem('network', function NetworkSystem(engine) {
  this.hooks = {
    'external.execute:pre!': (args) => {
      // Send it to the engine, while mapping the entity
      synchronizer.push({
        args: args.map(v => {
          if (v && v.id != null && engine.state.entities[v.id] === v) {
            return {
              __entity: v.id
            };
          }
          if (v instanceof Float32Array) {
            let a = [];
            for (let i = 0; i < v.length; ++i) {
              a[i] = v[i];
            }
            return a;
          }
          return v;
        })
      });
      return null;
    }
  };
});

engine.start();
engine.systems.test.init();

connector.start();
synchronizer.start();
synchronizer.on('tick', () => {
  engine.update(50/1000);
});
