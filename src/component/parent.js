import { signalRaw } from 'fudge';

export default {
  component: -1,
  schema: {
    parent: { type: 'entity', getValue: (entity) => entity.parent },
  },
  actions: {
    set: signalRaw(([entity, parent]) => {
      entity.parent = parent.id != null ? parent.id : parent;
    })
  }
};
