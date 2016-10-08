import { signalRaw } from 'fudge';

export default {
  actions: {
    select: signalRaw(function ([entity]) {
      this.state.global.selected = entity ? entity.id : -1;
    }),
    cursor: signalRaw(function ([pos]) {
      this.state.global.cursor = pos.slice(0, 3);
    })
  }
};
