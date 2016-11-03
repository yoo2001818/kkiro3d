import { signalRaw } from 'fudge';

export default {
  actions: {
    connect: signalRaw(function ([id, data]) {
      let index = this.systems.network.clients.indexOf(id);
      if (index !== -1) return;
      this.systems.network.clients.push(id);
      this.systems.network.clientData[id] = data || {};
    }),
    disconnect: signalRaw(function ([id]) {
      let index = this.systems.network.clients.indexOf(id);
      if (index === -1) return;
      this.systems.network.clients.splice(index, 1);
      delete this.systems.network.clientData[id];
    }),
    connectSelf: signalRaw(function () {
      this.systems.network.connected = true;
    }),
    disconnectSelf: signalRaw(function () {
      this.systems.network.connected = false;
    })
  }
};
