import { signalRaw } from 'fudge';

export default {
  actions: {
    set: signalRaw(function ([time]) {
      this.state.global.time = time;
    }),
    add: function (delta) {
      this.actions.time.set((this.state.global.time || 0) + delta);
    }
  },
  global: {
    time: 0
  }
};
