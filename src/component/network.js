import { signalRaw } from 'fudge';

export default {
  actions: {
    connect: signalRaw(function (id) {
      let index = this.systems.network.clients.indexOf(id);
      if (index !== -1) return;
      this.systems.network.clients.push(id);
    }),
    disconnect: signalRaw(function (id) {
      let index = this.systems.network.clients.indexOf(id);
      if (index === -1) return;
      this.systems.network.clients.splice(id, 1);
    }),
    connectSelf: signalRaw(function () {
      this.systems.network.connected = true;
    }),
    disconnectSelf: signalRaw(function () {
      this.systems.network.connected = false;
    })
  }
};
