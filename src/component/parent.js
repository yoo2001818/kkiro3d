import { signalRaw } from 'fudge';

export default {
  component: -1,
  actions: {
    set: signalRaw(([entity, parent]) => {
      entity.parent = parent.id != null ? parent.id : parent;
    })
  }
};
