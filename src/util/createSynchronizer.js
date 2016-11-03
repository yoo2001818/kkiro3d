import WebSocketClientConnector from
  'locksmith-connector-ws/lib/webSocketClientConnector';
import { Synchronizer } from 'locksmith';
import jsonReplacer from './jsonReplacer';

export default function createSynchronizer(type, engine, endpoint) {
  let connector = new WebSocketClientConnector(
    new WebSocket(endpoint));
  connector.replacer = jsonReplacer;

  let synchronizer = new Synchronizer(engine.systems.network.machine,
    connector);
  connector.synchronizer = synchronizer;

  engine.systems.network.synchronizer = synchronizer;

  connector.start({ type });
  synchronizer.on('tick', () => {
    engine.update(1/60);
  });
  synchronizer.on('connect', () => {
    engine.actions.network.connectSelf();
  });
  synchronizer.on('disconnect', () => {
    engine.actions.external.executeLocal('ui.setModal', {
      title: 'Connection Closed',
      data: 'The connection to the server has been closed.'
    });
    engine.actions.network.disconnectSelf();
  });
  synchronizer.on('error', (error) => {
    engine.actions.external.executeLocal('ui.setModal', {
      title: 'Network Error',
      data: error.message || (typeof error === 'string' && error) ||
        'An unknown error has occurred while doing network synchronization'
    });
  });
  return synchronizer;
}
