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

let connector = new WebSocketServerConnector({
  port: 23482
});
connector.replacer = jsonReplacer;

let synchronizer = new HostSynchronizer(engine.systems.network.machine,
connector, {
  dynamic: false,
  dynamicPushWait: 10,
  dynamicTickWait: 10,
  fixedTick: 1000/60,
  fixedBuffer: 0,
  disconnectWait: 10000,
  freezeWait: 1000
});
synchronizer.connectionHandler = (data, clientId) => ({
  id: clientId
});
synchronizer.on('connect', (clientId) => {
  engine.actions.external.execute('network.connect', clientId);
  if (clientId === 0) engine.actions.network.connectSelf();
});
synchronizer.on('disconnect', (clientId) => {
  engine.actions.external.execute('network.disconnect', clientId);
  if (clientId === 0) engine.actions.network.disconnectSelf();
});
connector.synchronizer = synchronizer;

engine.systems.network.synchronizer = synchronizer;

engine.start();
engine.systems.test.init();

connector.start();
synchronizer.start();
synchronizer.on('tick', () => {
  engine.update(1/60);
});
