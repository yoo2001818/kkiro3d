import { signalRaw } from 'fudge';

export default {
  actions: {
    select: signalRaw(function ([entity]) {
      this.state.global.selected = entity ? entity.id : -1;
    })
  }
};
